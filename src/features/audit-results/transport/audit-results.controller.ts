import { NextResponse } from 'next/server';
import { container } from '@/core/container';
import { withAuth } from '@/core/http/with-auth';
import {
  AddCommentSchema,
  ChangeSeveritySchema,
  CreateAuditResultSchema,
  ListQuerySchema,
  UpdateFieldsSchema,
  UpdateStatusSchema,
} from '../schemas';

const json = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);
const noContent = () => new NextResponse(null, { status: 204 });

const getQuery = (url: string) => Object.fromEntries(new URL(url).searchParams.entries());

export const auditResultsController = {
  list: withAuth({ action: 'auditResults.list' }, async (req) => {
    const query = ListQuerySchema.parse(getQuery(req.url));
    const result = await container.auditResults.list(query);
    return json(result);
  }),

  create: withAuth({ action: 'auditResults.create' }, async (req, ctx) => {
    const input = CreateAuditResultSchema.parse(await req.json());
    const created = await container.auditResults.create(input, { id: ctx.session.user.id });
    return json(created, { status: 201 });
  }),

  getById: withAuth<{ id: string }>({ action: 'auditResults.read' }, async (_req, ctx) => {
    const row = await container.auditResults.getById(ctx.params.id);
    return json(row);
  }),

  updateFields: withAuth<{ id: string }>(
    { action: 'auditResults.updateFields' },
    async (req, ctx) => {
      const input = UpdateFieldsSchema.parse(await req.json());
      const updated = await container.auditResults.updateFields(ctx.params.id, input, {
        id: ctx.session.user.id,
      });
      return json(updated);
    },
  ),

  updateStatus: withAuth<{ id: string }>(
    { action: 'auditResults.updateStatus' },
    async (req, ctx) => {
      const input = UpdateStatusSchema.parse(await req.json());
      const updated = await container.auditResults.updateStatus(ctx.params.id, input, {
        id: ctx.session.user.id,
      });
      return json(updated);
    },
  ),

  changeSeverity: withAuth<{ id: string }>(
    { action: 'auditResults.changeSeverity' },
    async (req, ctx) => {
      const input = ChangeSeveritySchema.parse(await req.json());
      const updated = await container.auditResults.changeSeverity(ctx.params.id, input, {
        id: ctx.session.user.id,
      });
      return json(updated);
    },
  ),

  confirmFinal: withAuth<{ id: string }>(
    { action: 'auditResults.confirmFinal' },
    async (_req, ctx) => {
      const updated = await container.auditResults.confirmFinal(ctx.params.id, {
        id: ctx.session.user.id,
      });
      return json(updated);
    },
  ),

  remove: withAuth<{ id: string }>({ action: 'auditResults.delete' }, async (_req, ctx) => {
    await container.auditResults.remove(ctx.params.id, { id: ctx.session.user.id });
    return noContent();
  }),

  listComments: withAuth<{ id: string }>({ action: 'comments.read' }, async (_req, ctx) => {
    const comments = await container.auditResults.listComments(ctx.params.id);
    return json(comments);
  }),

  addComment: withAuth<{ id: string }>({ action: 'comments.add' }, async (req, ctx) => {
    const input = AddCommentSchema.parse(await req.json());
    const comment = await container.auditResults.addComment(ctx.params.id, input, {
      id: ctx.session.user.id,
    });
    return json(comment, { status: 201 });
  }),

  distinctCategories: withAuth({ action: 'auditResults.list' }, async () => {
    const cats = await container.auditResults.distinctCategories();
    return json(cats);
  }),
};
