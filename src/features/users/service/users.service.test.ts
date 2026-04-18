import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@/generated/prisma/client';
import { ConflictError, NotFoundError } from '@/core/errors';
import { makeUsersService, type UsersService } from './users.service';
import type { AuditLogRecorder } from '@/features/audit-results/service/types';

const ACTOR = { id: 'admin-1' };

type Fixture = {
  db: DeepMockProxy<PrismaClient>;
  record: ReturnType<typeof vi.fn>;
  svc: UsersService;
};

function build(): Fixture {
  const db = mockDeep<PrismaClient>();
  const record = vi.fn(async () => {});
  const auditLog: AuditLogRecorder = { record };
  const svc = makeUsersService({ db, auditLog });
  return { db, record, svc };
}

const makeUser = (over: Partial<Record<string, unknown>> = {}) =>
  ({
    id: 'u1',
    email: 'u@example.com',
    name: 'U',
    passwordHash: 'hash',
    role: 'L1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  }) as never;

describe('users service', () => {
  let f: Fixture;
  beforeEach(() => {
    f = build();
  });

  it('create hashes password, rejects duplicate email, logs create', async () => {
    f.db.user.findUnique.mockResolvedValueOnce(null); // email check
    f.db.user.create.mockResolvedValue({
      id: 'new',
      email: 'x@x',
      name: 'X',
      role: 'L2',
      isActive: true,
    } as never);
    await f.svc.create({ email: 'x@x', name: 'X', password: 'strongPass1', role: 'L2' }, ACTOR);
    const data = f.db.user.create.mock.calls[0]?.[0]?.data;
    expect(data?.passwordHash).toBeDefined();
    expect(data?.passwordHash).not.toBe('strongPass1'); // hashed
    expect(f.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'create' }));
  });

  it('create throws ConflictError on duplicate email', async () => {
    f.db.user.findUnique.mockResolvedValueOnce(makeUser({ email: 'dup@x' }));
    await expect(
      f.svc.create({ email: 'dup@x', name: 'X', password: 'password!!', role: 'L1' }, ACTOR),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(f.db.user.create).not.toHaveBeenCalled();
  });

  it('changeRole is no-op when same role', async () => {
    f.db.user.findUnique.mockResolvedValue(makeUser({ role: 'L2' }));
    await f.svc.changeRole('u1', { role: 'L2' }, ACTOR);
    expect(f.db.user.update).not.toHaveBeenCalled();
    expect(f.record).not.toHaveBeenCalled();
  });

  it('changeRole updates and logs role_change', async () => {
    f.db.user.findUnique.mockResolvedValue(makeUser({ role: 'L1' }));
    f.db.user.update.mockResolvedValue(makeUser({ role: 'L3' }));
    await f.svc.changeRole('u1', { role: 'L3' }, ACTOR);
    expect(f.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'role_change', diff: { role: ['L1', 'L3'] } }),
    );
  });

  it('setActive toggles and logs', async () => {
    f.db.user.findUnique.mockResolvedValue(makeUser({ isActive: true }));
    f.db.user.update.mockResolvedValue(makeUser({ isActive: false }));
    await f.svc.setActive('u1', { isActive: false }, ACTOR);
    expect(f.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'active_change', diff: { isActive: [true, false] } }),
    );
  });

  it('update logs only changed fields and rejects dup email', async () => {
    f.db.user.findUnique
      .mockResolvedValueOnce(makeUser({ name: 'Old', email: 'a@b' })) // getById
      .mockResolvedValueOnce(makeUser({ id: 'other', email: 'new@b' })); // duplicate
    await expect(f.svc.update('u1', { email: 'new@b' }, ACTOR)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('update logs diff for name only change', async () => {
    f.db.user.findUnique.mockResolvedValueOnce(makeUser({ name: 'Old', email: 'a@b' }));
    f.db.user.update.mockResolvedValue(makeUser({ name: 'New', email: 'a@b' }));
    await f.svc.update('u1', { name: 'New' }, ACTOR);
    expect(f.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'update', diff: { name: ['Old', 'New'] } }),
    );
  });

  it('update is quiet when effectively nothing changed', async () => {
    f.db.user.findUnique.mockResolvedValueOnce(makeUser({ name: 'Same', email: 'a@b' }));
    f.db.user.update.mockResolvedValue(makeUser({ name: 'Same', email: 'a@b' }));
    await f.svc.update('u1', { name: 'Same' }, ACTOR);
    expect(f.record).not.toHaveBeenCalled();
  });

  it('remove throws NotFoundError for missing user', async () => {
    f.db.user.findUnique.mockResolvedValue(null);
    await expect(f.svc.remove('missing', ACTOR)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('remove deletes and logs', async () => {
    f.db.user.findUnique.mockResolvedValue(makeUser());
    f.db.user.delete.mockResolvedValue(makeUser());
    await f.svc.remove('u1', ACTOR);
    expect(f.db.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(f.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'delete' }));
  });

  it('list returns users ordered by role then name', async () => {
    f.db.user.findMany.mockResolvedValue([] as never);
    await f.svc.list();
    const call = f.db.user.findMany.mock.calls[0]?.[0];
    expect(call?.orderBy).toEqual([{ role: 'asc' }, { name: 'asc' }]);
  });
});
