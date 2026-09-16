import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginRegisterDto } from './dto/auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authServices: AuthService) {}

  @Post('/register')
  register(@Body() loginRegisterDto: LoginRegisterDto) {
    return this.authServices.registerUserInDB(loginRegisterDto);
  }

  @Post('/login')
  login(@Body() loginRegisterDto: LoginRegisterDto) {
    return this.authServices.loginUser(loginRegisterDto);
  }

  @Get('/logout')
  logout() {
    return {
      logout: true,
    };
  }
}
