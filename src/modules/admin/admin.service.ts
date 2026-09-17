import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { getErrorDetails } from '../../common/error.util.js';
import { SANITIZED_USER_OMIT } from '../auth/auth.service.js';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    try {
      return await this.prisma.user.findMany({
        omit: SANITIZED_USER_OMIT,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        'Error while trying to fetch all users:',
        getErrorDetails(error),
      );

      throw new InternalServerErrorException(
        'Failed to fetch users. Please try again.',
      );
    }
  }
}
