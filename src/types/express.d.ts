import type { Role } from '../generated/prisma/enums.js';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
    }
  }
}

export {};
