import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import config from '../../../config/index.js';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { AuthService } from '../auth.service.js';

function extractFromCookie(req: Request): string | null {
  return req.cookies?.refreshToken ?? null;
}

const extractRefreshToken = ExtractJwt.fromExtractors([
  ExtractJwt.fromAuthHeaderAsBearerToken(),
  extractFromCookie,
]);

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: extractRefreshToken,
      ignoreExpiration: false,
      secretOrKey: config.jwt_refresh_secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = extractRefreshToken(req);
    return this.authService.validateRefreshToken(
      payload.sub,
      refreshToken as string,
    );
  }
}
