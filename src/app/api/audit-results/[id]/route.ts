import { auditResultsController } from '@/features/audit-results/transport/audit-results.controller';

export const GET = auditResultsController.getById;
export const PATCH = auditResultsController.updateFields;
export const DELETE = auditResultsController.remove;
