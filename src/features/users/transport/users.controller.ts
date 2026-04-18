import { NextResponse } from 'next/server';
import { container } from '@/core/container';
import { withAuth } from '@/core/http/with-auth';
import { ChangeRoleSchema, CreateUserSchema, SetActiveSchema, UpdateUserSchema } from '../schemas';

const json = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);

export const usersController = {
  list: withAuth({ action: 'users.read' }, async () => {
    return json(await container.users.list());
  }),

  create: withAuth({ action: 'users.manage' }, async (req, ctx) => {
    const input = CreateUserSchema.parse(await req.json());
    const created = await container.users.create(input, { id: ctx.session.user.id });
    return json(created, { status: 201 });
  }),

  getById: withAuth<{ id: string }>({ action: 'users.read' }, async (_req, ctx) => {
    return json(await container.users.getById(ctx.params.id));
  }),

  update: withAuth<{ id: string }>({ action: 'users.manage' }, async (req, ctx) => {
    const input = UpdateUserSchema.parse(await req.json());
    return json(await container.users.update(ctx.params.id, input, { id: ctx.session.user.id }));
  }),

  changeRole: withAuth<{ id: string }>({ action: 'users.manage' }, async (req, ctx) => {
    const input = ChangeRoleSchema.parse(await req.json());
    return json(
      await container.users.changeRole(ctx.params.id, input, { id: ctx.session.user.id }),
    );
  }),

  setActive: withAuth<{ id: string }>({ action: 'users.manage' }, async (req, ctx) => {
    const input = SetActiveSchema.parse(await req.json());
    return json(await container.users.setActive(ctx.params.id, input, { id: ctx.session.user.id }));
  }),

  remove: withAuth<{ id: string }>({ action: 'users.manage' }, async (_req, ctx) => {
    await container.users.remove(ctx.params.id, { id: ctx.session.user.id });
    return new NextResponse(null, { status: 204 });
  }),
};
