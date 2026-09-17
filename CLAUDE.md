# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Nest Postify — a NestJS backend for a social posting platform (posts with optional single image, comments with a single reply, likes, premium subscriptions via payment, credentials + Google OAuth2.0 login). It's a learning/practice project; `docs/WORKFLOW.md` and `Credential_and_google_login_register.md` capture the author's own notes on NestJS concepts and the auth flow (the latter is written in Bengali as an interview-prep explainer — read it for the full rationale behind the auth design).

## Commands

There are no `lint`/`test` scripts wired up in `package.json` yet — invoke the tools directly:

```bash
npm run start:dev              # dev server with watch mode
npm run build                  # nest build
npm run start:prod             # run compiled dist/main

npx oxlint                     # lint (config: .oxlintrc.json)
npx prettier --write .         # format (or: npm run format)

npx vitest                     # unit tests (*.spec.ts, config: vitest.config.ts)
npx vitest run path/to/x.spec.ts   # single unit test file
npx vitest --config vitest.config.e2e.ts   # e2e tests (*.e2e-spec.ts)

npx prisma migrate dev --name <name>   # create + apply a migration
npx prisma generate                    # regenerate the Prisma client
```

Prisma client is generated into `src/generated/prisma` (not `node_modules`) — regenerate after any schema change, and never hand-edit files under `src/generated/`.

## Architecture

**ESM throughout.** `package.json` has `"type": "module"`; every relative import in `src/` must use an explicit `.js` extension (e.g. `import { AuthService } from './auth.service.js'`) even though the source files are `.ts`. This is required by `moduleResolution: "nodenext"` in `tsconfig.json`.

**Prisma schema is split by domain** under `prisma/schema/*.prisma` (`user`, `auth`, `post`, `comment`, `reply`, `payment`, `enum`) with a single `schema.prisma` holding just the `generator`/`datasource` blocks. `prisma.config.ts` points at the `prisma/schema` directory. `PrismaService` (`src/prisma/prisma.service.ts`) wraps `PrismaClient` with the `@prisma/adapter-pg` driver adapter and is exported from a `@Global()` `PrismaModule`, so it can be injected anywhere without re-importing the module.

**Config is centralized** in `src/config/index.ts` — a plain object built from `process.env` (loaded via `dotenv`), not `@nestjs/config`'s `ConfigService`. Import `config` from there rather than reading `process.env` directly in feature code.

**Global HTTP pipeline** (wired in `src/main.ts`):
- Prefix `/api/v1` on every route.
- CORS restricted to `config.frontend_url`, with credentials enabled.
- Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform` — DTOs are the enforcement point for request shape, not manual checks in controllers/services.
- Global `ResponseInterceptor` wraps every successful response as `{ success: true, data }`. Controllers should return plain data — never construct the envelope themselves.
- `RequestLoggerMiddleware` is applied (in `app.module.ts`) only to the controllers listed in `configure()` — add new controllers to that list if they need request logging.

**Auth module layering** (`src/modules/auth/`) — the pattern to follow for any new protected feature:
- `*.controller.ts` — thin: pick a guard, call one service method, return its result.
- `guards/` — one guard per Passport strategy (`local`, `jwt`, `jwt-refresh`, `google`), each just `class XGuard extends AuthGuard('name') {}`.
- `strategies/` — the actual credential-checking logic per method; strategies call into `AuthService`, never touch Prisma directly.
- `auth.service.ts` — business logic and all Prisma calls (registration, login, OAuth account linking, token issuance, logout).
- `token.service.ts` — isolated JWT sign/verify + bcrypt hash/compare for tokens, kept separate from `AuthService` because it's a generic concern.
- `decorators/current-user.decorator.ts` — `@CurrentUser()` reads `request.user` (set by Passport after a strategy's `validate()` succeeds).
- Sensitive fields (`password`, `hashedRefreshToken`) are excluded from Prisma reads via `omit: SANITIZED_USER_OMIT` (or manual destructuring) — apply the same omission on any new query that returns a `User`.

**Account linking model**: a `User` can have multiple `Auth` rows (one per login provider: `CREDENTIALS`, `GOOGLE`), enforced by `@@unique([provider, providerId])` and `@@unique([userId, provider])` on `Auth`. Registering/login with a new provider on an email that already exists links a new `Auth` row to the same `User` instead of creating a duplicate account — see `AuthService.registerUserInDB` and `AuthService.validateOAuthLogin`, which mirror each other.

**Token model**: short-lived access token + long-lived refresh token, signed with separate secrets (`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`). The refresh token is never stored in plaintext — only its bcrypt hash lives in `User.hashedRefreshToken`. Every `/auth/refresh` call rotates both tokens and overwrites the stored hash; logout sets `hashedRefreshToken` to `null`, which invalidates the refresh token immediately (the access token remains valid until it naturally expires, since `JwtStrategy.validate()` is intentionally stateless with no DB check).

**Error handling convention**: service methods that wrap Prisma calls in `try/catch` must re-throw anything that's already an `HttpException` unchanged, and only convert genuinely unexpected errors into `InternalServerErrorException` (logging via `getErrorDetails()` from `src/common/error.util.ts`). A bare `catch` that turns every error into one status code was an actual bug here — don't reintroduce it.

**Module structure**: each feature lives under `src/modules/<name>/` with its own `*.module.ts`, `*.controller.ts`, `*.service.ts`, plus `dto/`, `interfaces/`, `guards/`, `strategies/`, `decorators/` subfolders as needed (mirrors `auth`). `UsersModule` currently has stub/placeholder logic — treat it as scaffolding, not a reference implementation.
