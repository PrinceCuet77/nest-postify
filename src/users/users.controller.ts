import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/users')
  getAllUsers(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  getSingleUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getSingleUser(id);
  }
}
