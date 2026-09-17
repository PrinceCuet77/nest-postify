import { AuthProvider } from '../../generated/prisma/enums.js';
import config from '../../config/index.js';

interface UserWithAvatarSources {
  activeProvider: AuthProvider | null;
  avatarUrlForGoogle: string | null;
  avatarKey: string | null;
}

export function resolveAvatarUrl(user: UserWithAvatarSources): string | null {
  if (user.activeProvider === AuthProvider.GOOGLE) {
    return user.avatarUrlForGoogle;
  }

  if (user.activeProvider === AuthProvider.CREDENTIALS && user.avatarKey) {
    return `${config.avatar_s3_base_url}/${user.avatarKey}`;
  }

  return null;
}
