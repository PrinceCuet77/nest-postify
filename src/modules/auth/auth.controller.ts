import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/auth.dto.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { setAuthCookies, clearAuthCookies } from './cookie.util.js';
import config from '../../config/index.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.registerUserInDB(registerDto);
    const tokens = await this.authService.issueAuthTokens(user);
    setAuthCookies(res, tokens);
    return { user, ...tokens };
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @CurrentUser() user: Express.User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.issueAuthTokens(user);
    setAuthCookies(res, tokens);
    return { user, ...tokens };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {
    // Passport redirects to Google's consent screen; body left intentionally empty.
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthCallback(
    @CurrentUser() user: Express.User,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.issueAuthTokens(user);
    setAuthCookies(res, tokens);

    const redirectUrl = new URL('/oauth/callback', config.frontend_url);
    redirectUrl.searchParams.set('accessToken', tokens.accessToken);
    redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);

    res.redirect(redirectUrl.toString());
  }

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @CurrentUser() user: Express.User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.issueAuthTokens(user);
    setAuthCookies(res, tokens);
    return tokens;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser() user: Express.User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);
    clearAuthCookies(res);
    return { loggedOut: true };
  }
}
