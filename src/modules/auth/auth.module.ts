import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TokenService } from './token.service.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import config from '../../config/index.js';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: config.jwt_access_secret,
      signOptions: { expiresIn: config.jwt_access_expires_in },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
