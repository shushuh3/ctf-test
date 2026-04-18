import bcrypt from 'bcrypt';
import type { PrismaClient } from '@/generated/prisma/client';
import type { Role } from '@/generated/prisma/enums';
import { ConflictError, NotFoundError } from '@/core/errors';
import type { AuditLogRecorder } from '@/features/audit-results/service/types';
import type { ChangeRoleInput, CreateUserInput, SetActiveInput, UpdateUserInput } from '../schemas';

type Deps = { db: PrismaClient; auditLog: AuditLogRecorder };
type Actor = { id: string };

const BCRYPT_ROUNDS = 10;

export function makeUsersService({ db, auditLog }: Deps) {
  async function getByIdOrThrow(id: string) {
    const u = await db.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundError('User', id);
    return u;
  }

  return {
    async list() {
      return db.user.findMany({
        orderBy: [{ role: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    },

    async getById(id: string) {
      return getByIdOrThrow(id);
    },

    async create(input: CreateUserInput, actor: Actor) {
      const existing = await db.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new ConflictError(`Пользователь с email ${input.email} уже существует`);
      }
      const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
      const created = await db.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash,
          role: input.role as Role,
        },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });
      await auditLog.record({
        entityType: 'User',
        entityId: created.id,
        action: 'create',
        actorId: actor.id,
        diff: { role: [null, created.role], email: [null, created.email] },
      });
      return created;
    },

    async update(id: string, input: UpdateUserInput, actor: Actor) {
      const before = await getByIdOrThrow(id);
      if (input.email && input.email !== before.email) {
        const dup = await db.user.findUnique({ where: { email: input.email } });
        if (dup) throw new ConflictError(`Email ${input.email} уже используется`);
      }
      const updated = await db.user.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.email !== undefined ? { email: input.email } : {}),
        },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });
      const diff: Record<string, readonly [unknown, unknown]> = {};
      if (before.name !== updated.name) diff.name = [before.name, updated.name] as const;
      if (before.email !== updated.email) diff.email = [before.email, updated.email] as const;
      if (Object.keys(diff).length > 0) {
        await auditLog.record({
          entityType: 'User',
          entityId: id,
          action: 'update',
          actorId: actor.id,
          diff,
        });
      }
      return updated;
    },

    async changeRole(id: string, input: ChangeRoleInput, actor: Actor) {
      const before = await getByIdOrThrow(id);
      if (before.role === input.role) return before;
      const updated = await db.user.update({
        where: { id },
        data: { role: input.role as Role },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });
      await auditLog.record({
        entityType: 'User',
        entityId: id,
        action: 'role_change',
        actorId: actor.id,
        diff: { role: [before.role, updated.role] },
      });
      return updated;
    },

    async setActive(id: string, input: SetActiveInput, actor: Actor) {
      const before = await getByIdOrThrow(id);
      if (before.isActive === input.isActive) return before;
      const updated = await db.user.update({
        where: { id },
        data: { isActive: input.isActive },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });
      await auditLog.record({
        entityType: 'User',
        entityId: id,
        action: 'active_change',
        actorId: actor.id,
        diff: { isActive: [before.isActive, updated.isActive] },
      });
      return updated;
    },

    async remove(id: string, actor: Actor) {
      await getByIdOrThrow(id);
      await db.user.delete({ where: { id } });
      await auditLog.record({
        entityType: 'User',
        entityId: id,
        action: 'delete',
        actorId: actor.id,
        diff: {},
      });
    },
  };
}

export type UsersService = ReturnType<typeof makeUsersService>;
