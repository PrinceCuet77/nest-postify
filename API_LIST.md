# API List

Tracks every API this project needs, grouped by module, with what's already
built vs. what's still pending. Update this file whenever an endpoint is
added, changed, or removed — it should stay a live checklist, not a
one-time snapshot.

## Legend

| Symbol | Meaning                                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| ✅     | Implemented and working                                                                                                           |
| 🚧     | Stub only — route exists but logic is placeholder (per `CLAUDE.md`, `UsersModule` is scaffolding, not a reference implementation) |
| ⬜     | Not started                                                                                                                       |

## Summary

| Module                | Total APIs | Done  | Stub  | Not started |
| --------------------- | ---------- | ----- | ----- | ----------- |
| Auth                  | 6          | 6     | 0     | 0           |
| Users                 | 4          | 1     | 0     | 3           |
| Posts                 | 7          | 0     | 0     | 7           |
| Comments              | 7          | 0     | 0     | 7           |
| Replies               | 6          | 0     | 0     | 6           |
| Payments (SSLCommerz) | 8          | 0     | 0     | 8           |
| Admin                 | 16         | 1     | 0     | 15          |
| **Total**             | **54**     | **8** | **0** | **46**      |

---

## 1. Auth (`src/modules/auth/`) — 6/6 done

| Status | Method | Endpoint                | Notes                                                                     |
| ------ | ------ | ----------------------- | ------------------------------------------------------------------------- |
| ✅     | POST   | `/auth/register`        | Credentials registration; links to existing `User` by email if one exists |
| ✅     | POST   | `/auth/login`           | `LocalAuthGuard`, credentials login                                       |
| ✅     | GET    | `/auth/google`          | Kicks off Google OAuth2 consent screen                                    |
| ✅     | GET    | `/auth/google/callback` | Google OAuth2 callback, issues tokens, redirects to frontend              |
| ✅     | POST   | `/auth/refresh`         | `JwtRefreshAuthGuard`, rotates access + refresh tokens                    |
| ✅     | POST   | `/auth/logout`          | `JwtAuthGuard`, clears `hashedRefreshToken` + cookies                     |

## 2. Users (`src/modules/users/`) — 1/4 done

| Status | Method | Endpoint               | Notes                                                                                                                    |
| ------ | ------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| ✅     | GET    | `/user/getMyProfile`    | `JwtAuthGuard`; returns the logged-in user's own profile via `@CurrentUser()`, `SANITIZED_USER_OMIT` + `withAvatarUrl` |
| ⬜     | PATCH  | `/user/updateProfile`   | Update own info — `name`, `bio`, `profession`                                                                          |
| ⬜     | PATCH  | `/user/updateAvatar`    | Upload/replace avatar image, stored in S3 (`avatarKey` + `avatar_s3_base_url` from config)                             |
| ⬜     | POST   | `/user/changePassword`  | Change own password (credentials users only)                                                                           |

> The old stub methods on `UsersController` (`getAllUsers`/`getSingleUser`, previously mounted at `/users/users` and `/users/:id`) were removed as part of building this module out for real; user listing now lives under `/admin/getAllUsers` (section 7) instead.

## 3. Posts — 0/7 done (module not yet created)

| Status | Method | Endpoint          | Notes                                                                                                                                                    |
| ------ | ------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⬜     | POST   | `/posts`          | Create post — `description` required, `imageKey` optional, but **not both text-only and image-only at once**; DTO must enforce "text, or text+one image" |
| ⬜     | GET    | `/posts`          | List/feed posts, paginated                                                                                                                               |
| ⬜     | GET    | `/posts/:id`      | Get single post with its comments                                                                                                                        |
| ⬜     | PATCH  | `/posts/:id`      | Update own post                                                                                                                                          |
| ⬜     | DELETE | `/posts/:id`      | Delete (or soft-delete via `PostStatus.DELETED`) own post                                                                                                |
| ⬜     | POST   | `/posts/:id/like` | Like a post                                                                                                                                              |
| ⬜     | DELETE | `/posts/:id/like` | Unlike a post                                                                                                                                            |

> Schema note: `Post.likes` is a plain counter with no per-user join table, so there's currently no way to tell whether a given user already liked a post (can't enforce "like once" or unlike reliably). Recommend adding a `PostLike` join model (`@@unique([userId, postId])`) before building the like endpoints.

## 4. Comments — 0/7 done (module not yet created)

| Status | Method | Endpoint                  | Notes                                         |
| ------ | ------ | ------------------------- | --------------------------------------------- |
| ⬜     | POST   | `/posts/:postId/comments` | Add a comment to a post                       |
| ⬜     | GET    | `/posts/:postId/comments` | List comments for a post                      |
| ⬜     | GET    | `/comments/:id`           | Get a single comment (with its reply, if any) |
| ⬜     | PATCH  | `/comments/:id`           | Update own comment                            |
| ⬜     | DELETE | `/comments/:id`           | Delete own comment                            |
| ⬜     | POST   | `/comments/:id/like`      | Like a comment                                |
| ⬜     | DELETE | `/comments/:id/like`      | Unlike a comment                              |

> Same schema note as Posts applies to `Comment.likes` — a `CommentLike` join model is recommended for the like/unlike pair to be idempotent.

## 5. Replies — 0/6 done (module not yet created)

| Status | Method | Endpoint                     | Notes                                                                                                                                             |
| ------ | ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⬜     | POST   | `/comments/:commentId/reply` | Create the reply on a comment — schema already enforces "only one" via `Reply.commentId @unique`, service should return a clean 409 if one exists |
| ⬜     | GET    | `/comments/:commentId/reply` | Get the reply for a comment                                                                                                                       |
| ⬜     | PATCH  | `/replies/:id`               | Update own reply                                                                                                                                  |
| ⬜     | DELETE | `/replies/:id`               | Delete own reply                                                                                                                                  |
| ⬜     | POST   | `/replies/:id/like`          | Like a reply                                                                                                                                      |
| ⬜     | DELETE | `/replies/:id/like`          | Unlike a reply                                                                                                                                    |

> Same schema note as above — a `ReplyLike` join model recommended.

## 6. Payments / Premium subscription (SSLCommerz) — 0/8 done (module not yet created)

Fixed premium subscription fee: **200 BDT**.

| Status | Method | Endpoint                          | Notes                                                                                                                                          |
| ------ | ------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| ⬜     | POST   | `/payments/subscribe`             | Create a `Payment` row (`PENDING`, amount 200 BDT), init SSLCommerz session, return the gateway redirect URL                                   |
| ⬜     | POST   | `/payments/ipn`                   | SSLCommerz server-to-server IPN listener — verifies transaction with SSLCommerz Validation API, updates `Payment.status` + `gatewayResponse`   |
| ⬜     | POST   | `/payments/success`               | SSLCommerz success redirect — confirm + mark `Payment.status = SUCCESS`, `paidAt`, set `User.isPremiumUser = true` (and `role = PREMIUM_USER`) |
| ⬜     | POST   | `/payments/fail`                  | SSLCommerz fail redirect — mark `Payment.status = FAILED`                                                                                      |
| ⬜     | POST   | `/payments/cancel`                | SSLCommerz cancel redirect — mark `Payment.status = CANCELLED`                                                                                 |
| ⬜     | GET    | `/payments`                       | List own payment/subscription history                                                                                                          |
| ⬜     | GET    | `/payments/:id`                   | Get a single payment/transaction detail                                                                                                        |
| ⬜     | GET    | `/payments/status/:transactionId` | Convenience lookup for a transaction's current status                                                                                          |

> Requires new config values (store ID/password, sandbox flag, success/fail/cancel/ipn URLs) in `src/config/index.ts`, following the existing pattern used for Google OAuth. SSLCommerz's success/fail/cancel callbacks are `POST` with `application/x-www-form-urlencoded` bodies, not JSON — the global `ValidationPipe`/DTOs for these three routes need to account for that.

## 7. Admin (`src/modules/admin/`) — 1/16 done

Admin-only surface for monitoring and controlling the platform: user
moderation, content moderation, payment oversight, and platform stats.
Every route below sits behind `JwtAuthGuard` plus `RolesGuard` +
`@Roles(Role.ADMIN)` — `RolesGuard`/`@Roles()` now exist at
`src/common/guards/roles.guard.ts` / `src/common/decorators/roles.decorator.ts`,
reading `request.user.role` (already present on the JWT payload) via
`Reflector`, so this prerequisite is resolved for the rest of the module.

### 7.1 User management

| Status | Method | Endpoint                  | Notes                                                                                                              |
| ------ | ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ✅     | GET    | `/admin/getAllUsers`        | `JwtAuthGuard` + `RolesGuard`(`Role.ADMIN`); lists all users, `SANITIZED_USER_OMIT`, newest first — no pagination/filtering yet |
| ⬜     | GET    | `/admin/users/:id`          | Full detail on any single user (still excluding `password`/`hashedRefreshToken`)                                  |
| ⬜     | PATCH  | `/admin/users/:id/status`   | Change `UserStatus` — verify a user, or suspend/unsuspend one                                                     |
| ⬜     | PATCH  | `/admin/users/:id/role`     | Promote/demote a user's `Role` (e.g. grant `ADMIN`, or revoke `PREMIUM_USER` manually)                            |
| ⬜     | DELETE | `/admin/users/:id`          | Hard-delete or ban a user account                                                                                 |

### 7.2 Content moderation

| Status | Method | Endpoint                  | Notes                                                                                        |
| ------ | ------ | -------------------------- | ---------------------------------------------------------------------------------------------- |
| ⬜     | GET    | `/admin/posts`              | List all posts regardless of `PostStatus` (including `DRAFT`/`DELETED`), filterable/paginated |
| ⬜     | PATCH  | `/admin/posts/:id/status`   | Moderate a post — archive or take it down (`ARCHIVED`/`DELETED`) without needing the author    |
| ⬜     | DELETE | `/admin/comments/:id`       | Remove any comment (moderation), regardless of author                                         |
| ⬜     | DELETE | `/admin/replies/:id`        | Remove any reply (moderation), regardless of author                                           |

### 7.3 Payment oversight

| Status | Method | Endpoint                     | Notes                                                                                     |
| ------ | ------ | ----------------------------- | -------------------------------------------------------------------------------------------- |
| ⬜     | GET    | `/admin/payments`              | List all transactions across all users, filterable by `PaymentStatus`, paginated             |
| ⬜     | GET    | `/admin/payments/:id`          | Full detail on any single transaction, including `gatewayResponse`                           |
| ⬜     | PATCH  | `/admin/payments/:id/refund`   | Mark a `SUCCESS` payment as `REFUNDED` (and downgrade the user if the refund revokes premium) |

### 7.4 Platform stats

| Status | Method | Endpoint                    | Notes                                                                                                             |
| ------ | ------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ⬜     | GET    | `/admin/stats/overview`        | Headline counts: total users, posts, comments, premium users, revenue to date                                    |
| ⬜     | GET    | `/admin/stats/users`           | User growth over time (signups by day/week/month)                                                                |
| ⬜     | GET    | `/admin/stats/revenue`         | Revenue/subscription trend over time, broken down by `PaymentStatus`                                             |
| ⬜     | GET    | `/admin/stats/content`         | Content activity — posts/comments/replies created over time, most-liked posts                                    |
