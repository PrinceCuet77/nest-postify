import type { Response } from 'express';
import ms from 'ms';
import config from '../../config/index.js';
import { AuthTokens } from './interfaces/jwt-payload.interface.js';

const isProduction = config.node_env === 'production';

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
};

// Refresh token cookie is scoped to /api/v1/auth so it is only ever sent
// on refresh/logout requests, not on every request to the API.
const REFRESH_COOKIE_PATH = '/api/v1/auth';

export function setAuthCookies(res: Response, tokens: AuthTokens): void {
  res.cookie('accessToken', tokens.accessToken, {
    ...baseCookieOptions,
    path: '/',
    maxAge: ms(config.jwt_access_expires_in),
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    ...baseCookieOptions,
    path: REFRESH_COOKIE_PATH,
    maxAge: ms(config.jwt_refresh_expires_in),
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', { ...baseCookieOptions, path: '/' });
  res.clearCookie('refreshToken', {
    ...baseCookieOptions,
    path: REFRESH_COOKIE_PATH,
  });
}
