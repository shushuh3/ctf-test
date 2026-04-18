import { NextResponse } from 'next/server';
import { container } from '@/core/container';
import { withAuth } from '@/core/http/with-auth';

export const auditLogController = {
  listForResult: withAuth<{ id: string }>({ action: 'auditLog.read' }, async (_req, ctx) => {
    const entries = await container.auditLog.listForEntity('AuditResult', ctx.params.id);
    return NextResponse.json(entries);
  }),
};
