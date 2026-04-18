import type { Role } from '@/generated/prisma/enums';

// Re-export из Prisma-enum для единой точки правды
export { Role };

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};
