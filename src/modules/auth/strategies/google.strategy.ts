import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import config from '../../../config/index.js';
import { AuthService } from '../auth.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: config.google_client_id,
      clientSecret: config.google_client_secret,
      callbackURL: config.google_callback_url,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(
        new UnauthorizedException('Google account has no accessible email'),
        false,
      );
      return;
    }

    const user = await this.authService.validateOAuthLogin({
      providerId: profile.id,
      email,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    });

    done(null, user);
  }
}
