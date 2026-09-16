declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport-strategy';
  import { Request } from 'express';

  export type JwtFromRequestFunction = (req: Request) => string | null;

  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey?: string;
    ignoreExpiration?: boolean;
    passReqToCallback?: false;
  }

  export interface StrategyOptionsWithRequest extends Omit<
    StrategyOptions,
    'passReqToCallback'
  > {
    passReqToCallback: true;
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions | StrategyOptionsWithRequest,
      verify: (...args: any[]) => void,
    );
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
    fromHeader(headerName: string): JwtFromRequestFunction;
    fromBodyField(fieldName: string): JwtFromRequestFunction;
    fromUrlQueryParameter(paramName: string): JwtFromRequestFunction;
    fromExtractors(
      extractors: JwtFromRequestFunction[],
    ): JwtFromRequestFunction;
  };
}
