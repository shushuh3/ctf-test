import { auditResultsController } from '@/features/audit-results/transport/audit-results.controller';

export const GET = auditResultsController.list;
export const POST = auditResultsController.create;
