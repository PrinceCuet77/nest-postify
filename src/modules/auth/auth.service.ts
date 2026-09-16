import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRegisterDto } from './dto/auth.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import bcrypt from 'bcryptjs';
import {
  AuthProvider,
  Role,
  UserStatus,
} from '../../generated/prisma/enums.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async registerUserInDB(loginRegisterDto: LoginRegisterDto) {
    const { email, password } = loginRegisterDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { auths: true },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.USER,
        status: UserStatus.VERIFIED,
        auths: {
          create: {
            provider: AuthProvider.CREDENTIALS,
            providerId: email,
          },
        },
      },
      omit: { password: true },
      include: { auths: true },
    });

    return createdUser;
  }

  async loginUser(loginRegisterDto: LoginRegisterDto) {
    const { email, password } = loginRegisterDto;
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
        'This account does not have password, Please login with google',
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Password does not matched');
    }

    const { accessToken, refreshToken } = createUserTokens(
      user.id,
      user.email,
      user.role,
    );

    setAuthCookie(res, { accessToken, refreshToken });

    const { password: pass, ...restUserInfo } = user;

    return restUserInfo;
  }
}
