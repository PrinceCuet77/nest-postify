import { AuthProvider } from '../../generated/prisma/enums.js';
import config from '../../config/index.js';

interface UserWithAvatarSources {
  activeProvider: AuthProvider | null;
  avatarUrlForGoogle: string | null;
  avatarKey: string | null;
}

function resolveAvatarUrl(user: UserWithAvatarSources): string | null {
  if (user.activeProvider === AuthProvider.GOOGLE) {
    return user.avatarUrlForGoogle;
  }

  if (user.activeProvider === AuthProvider.CREDENTIALS && user.avatarKey) {
    return `${config.avatar_s3_base_url}/${user.avatarKey}`;
  }

  return null;
}

/**
 * Promotes the correct avatar source based on the provider the user is
 * currently logged in with, so clients don't have to pick between
 * avatarUrlForGoogle/avatarKey themselves.
 */
export function withAvatarUrl<T extends UserWithAvatarSources>(
  user: T,
): T & { avatarUrl: string | null } {
  return { ...user, avatarUrl: resolveAvatarUrl(user) };
}
