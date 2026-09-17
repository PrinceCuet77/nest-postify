import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service.js';
import { getErrorDetails } from '../../common/error.util.js';
import {
  AuthProvider,
  Role,
  UserStatus,
} from '../../generated/prisma/enums.js';
import { TokenService } from './token.service.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';
import { AuthTokens, JwtPayload } from './interfaces/jwt-payload.interface.js';
import { GoogleProfile } from './interfaces/google-profile.interface.js';
import { withAvatarUrl } from './auth.util.js';
import config from '../../config/index.js';

export const SANITIZED_USER_OMIT = {
  password: true,
  hashedRefreshToken: true,
} as const;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async registerUserInDB(registerDto: RegisterDto) {
    try {
      const { email, password } = registerDto;
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
        include: { auths: true },
      });

      let linkToUserId: string | null = null;

      if (existingUser) {
        if (existingUser.status === UserStatus.SUSPENDED) {
          throw new ForbiddenException(
            'User is suspended. Please contact to the admin.',
          );
        }

        const hasCredentials = existingUser.auths.some(
          (auth) => auth.provider === AuthProvider.CREDENTIALS,
        );

        if (hasCredentials) {
          throw new ConflictException('User with this email already exists');
        }

        // Account only has a Google login so far — allow adding a credentials
        // login on top of it instead of blocking the signup.
        linkToUserId = existingUser.id;
      }

      const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_round) || 10,
      );

      const createdOrUpdatedUser = linkToUserId
        ? await this.prisma.user.update({
            where: { id: linkToUserId },
            data: {
              password: hashedPassword,
              status: UserStatus.VERIFIED,
              activeProvider: AuthProvider.CREDENTIALS,
              auths: {
                create: {
                  provider: AuthProvider.CREDENTIALS,
                  providerId: email,
                },
              },
            },
            omit: SANITIZED_USER_OMIT,
          })
        : await this.prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              role: Role.USER,
              status: UserStatus.VERIFIED,
              activeProvider: AuthProvider.CREDENTIALS,
              auths: {
                create: {
                  provider: AuthProvider.CREDENTIALS,
                  providerId: email,
                },
              },
            },
            omit: SANITIZED_USER_OMIT,
          });

      return withAvatarUrl(createdOrUpdatedUser);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error while trying to register:', {
        ...getErrorDetails(error),
        email: registerDto.email,
      });

      throw new InternalServerErrorException(
        'Failed to process register. Please try again.',
      );
    }
  }

  async validateCredentials(
    email: LoginDto['email'],
    password: LoginDto['password'],
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { auths: true },
      });

      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      if (user.status === UserStatus.NOT_VERIFIED) {
        throw new ForbiddenException(
          'User is not verified. Please verify the account',
        );
      }

      if (user.status === UserStatus.SUSPENDED) {
        throw new ForbiddenException(
          'User is suspended. Please contact with the admin',
        );
      }

      if (!user.password) {
        throw new UnauthorizedException(
          'This account does not have a password. Please login with Google.',
        );
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        throw new UnauthorizedException('Email or password is incorrect');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { activeProvider: AuthProvider.CREDENTIALS },
        omit: SANITIZED_USER_OMIT,
      });

      return withAvatarUrl(updatedUser);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error while trying to login:', {
        ...getErrorDetails(error),
        email,
      });

      throw new InternalServerErrorException(
        'Failed to process login. Please try again.',
      );
    }
  }

  async validateOAuthLogin(profile: GoogleProfile) {
    const { email, name, avatarUrl, providerId } = profile;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { auths: true },
    });

    if (existingUser) {
      if (existingUser.status === UserStatus.SUSPENDED) {
        throw new ForbiddenException(
          'User is suspended. Please contact to the admin.',
        );
      }

      const hasGoogleAuth = existingUser.auths.some(
        (auth) => auth.provider === AuthProvider.GOOGLE,
      );

      if (!hasGoogleAuth) {
        // Account only has a credentials login so far — link the Google
        // identity to it instead of creating a duplicate account.
        await this.prisma.auth.create({
          data: {
            provider: AuthProvider.GOOGLE,
            providerId,
            userId: existingUser.id,
          },
        });
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: existingUser.name ?? name,
          avatarUrlForGoogle: avatarUrl,
          status: UserStatus.VERIFIED,
          activeProvider: AuthProvider.GOOGLE,
        },
        omit: SANITIZED_USER_OMIT,
      });

      return withAvatarUrl(updatedUser);
    }

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        name,
        avatarUrlForGoogle: avatarUrl,
        role: Role.USER,
        status: UserStatus.VERIFIED,
        activeProvider: AuthProvider.GOOGLE,
        auths: {
          create: {
            provider: AuthProvider.GOOGLE,
            providerId,
          },
        },
      },
      omit: SANITIZED_USER_OMIT,
    });

    return withAvatarUrl(createdUser);
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenMatching = await this.tokenService.compareToken(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException('Access denied');
    }

    const {
      password: _password,
      hashedRefreshToken: _hashedRefreshToken,
      ...sanitizedUser
    } = user;

    return sanitizedUser;
  }

  async issueAuthTokens(user: {
    id: string;
    email: string;
    role: Role;
  }): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.tokenService.generateAuthTokens(payload);
    const hashedRefreshToken = await this.tokenService.hashToken(
      tokens.refreshToken,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });
  }
}
