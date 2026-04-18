import { auditResultsController } from '@/features/audit-results/transport/audit-results.controller';

export const GET = auditResultsController.listComments;
export const POST = auditResultsController.addComment;
