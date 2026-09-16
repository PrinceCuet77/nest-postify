import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import config from '../../../config/index.js';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { AuthService } from '../auth.service.js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt_refresh_secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return this.authService.validateRefreshToken(
      payload.sub,
      refreshToken as string,
    );
  }
}
