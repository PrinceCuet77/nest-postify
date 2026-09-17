import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  PresignedUrlDto,
  PresignedUrlDto,
  UdpateUsersDto,
  UpdateAvatarKeyDto,
} from './dto/users.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(@CurrentUser() user: Express.User) {
    return this.usersService.getMyProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateUserProfile(
    @CurrentUser() user: Express.User,
    @Body() udpateUsersDto: UdpateUsersDto,
  ) {
    // return this.usersService.updateUserProfile(user.id, udpateUsersDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar/presign')
  generatePresignedUrl(
    @CurrentUser() user: Express.User,
    @Body() presignedUrlDto: PresignedUrlDto,
  ) {
    // return this.usersService.generatePresignedUrl(user.id, presignedUrlDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/avatar')
  updateUserAvatarUrl(
    @CurrentUser() user: Express.User,
    @Body() updateAvatarKeyDto: UpdateAvatarKeyDto,
  ) {
    // return this.usersService.updateUserAvatarUrl(user.id, updateAvatarKeyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/avatar')
  deleteUserAvatar(@CurrentUser() user: Express.User) {
    // return this.usersService.deleteUserAvatar(user.id);
  }
}
