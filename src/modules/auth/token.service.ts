import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import config from '../../config/index.js';
import { AuthTokens, JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  private generateAccessToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload, {
      secret: config.jwt_access_secret,
      expiresIn: config.jwt_access_expires_in,
    });
  }

  private generateRefreshToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload, {
      secret: config.jwt_refresh_secret,
      expiresIn: config.jwt_refresh_expires_in,
    });
  }

  async generateAuthTokens(payload: JwtPayload): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, Number(config.bcrypt_salt_round) || 10);
  }

  compareToken(token: string, hashedToken: string): Promise<boolean> {
    return bcrypt.compare(token, hashedToken);
  }
}
