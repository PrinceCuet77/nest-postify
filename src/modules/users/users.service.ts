import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { getErrorDetails } from '../../common/error.util.js';
import { SANITIZED_USER_OMIT } from '../auth/auth.service.js';
import { resolveAvatarUrl } from '../auth/auth.util.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        omit: SANITIZED_USER_OMIT,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return { ...user, avatarUrl: resolveAvatarUrl(user) };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error while trying to fetch profile:', {
        ...getErrorDetails(error),
        userId,
      });

      throw new InternalServerErrorException(
        'Failed to fetch profile. Please try again.',
      );
    }
  }
}
