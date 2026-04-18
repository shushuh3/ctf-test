import { z } from 'zod';
import { buildOpenApiDocument, registerRoute, openApiRegistry } from '@/core/openapi/registry';
import {
  AddCommentSchema,
  ChangeSeveritySchema,
  CreateAuditResultSchema,
  ListQuerySchema,
  UpdateFieldsSchema,
  UpdateStatusSchema,
} from '@/features/audit-results/schemas';
import {
  ChangeRoleSchema,
  CreateUserSchema,
  SetActiveSchema,
  UpdateUserSchema,
} from '@/features/users/schemas';
import { RiskInputSchema } from '@/features/calculators/risk/risk';
import { SlaInputSchema } from '@/features/calculators/sla/sla';
import { ComplianceInputSchema } from '@/features/calculators/compliance/compliance';

let registered = false;

// Общие ответы
const ErrorSchema = z
  .object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  })
  .openapi('Error');

const AuditResultRef = z
  .object({
    id: z.string(),
    title: z.string(),
    systemId: z.string(),
    category: z.string(),
    description: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CONFIRMED']),
    assigneeId: z.string().nullable(),
    foundAt: z.string().datetime(),
    dueAt: z.string().datetime().nullable(),
    resolvedAt: z.string().datetime().nullable(),
    riskScore: z.number().int(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('AuditResult');

const UserRef = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.enum(['ADMIN', 'L1', 'L2', 'L3']),
    isActive: z.boolean(),
  })
  .openapi('User');

export function buildSpec() {
  if (!registered) {
    // Регистрация schemas в реестре (чтобы они попали в components.schemas)
    openApiRegistry.register('Error', ErrorSchema);
    openApiRegistry.register('AuditResult', AuditResultRef);
    openApiRegistry.register('User', UserRef);
    openApiRegistry.register('ListQuery', ListQuerySchema);
    openApiRegistry.register('CreateAuditResult', CreateAuditResultSchema);
    openApiRegistry.register('UpdateStatus', UpdateStatusSchema);
    openApiRegistry.register('UpdateFields', UpdateFieldsSchema);
    openApiRegistry.register('ChangeSeverity', ChangeSeveritySchema);
    openApiRegistry.register('AddComment', AddCommentSchema);
    openApiRegistry.register('CreateUser', CreateUserSchema);
    openApiRegistry.register('UpdateUser', UpdateUserSchema);
    openApiRegistry.register('ChangeRole', ChangeRoleSchema);
    openApiRegistry.register('SetActive', SetActiveSchema);
    openApiRegistry.register('RiskInput', RiskInputSchema);
    openApiRegistry.register('SlaInput', SlaInputSchema);
    openApiRegistry.register('ComplianceInput', ComplianceInputSchema);

    const AUDIT = 'Audit Results';
    const USERS = 'Users';
    const CALC = 'Calculators';
    const DASH = 'Dashboard';

    const err = (status: number, description: string) => ({
      [status]: {
        description,
        content: { 'application/json': { schema: ErrorSchema } },
      },
    });
    const common = {
      ...err(401, 'Unauthorized'),
      ...err(403, 'Forbidden (insufficient role)'),
    };

    // ---- Audit Results ----
    registerRoute({
      method: 'get',
      path: '/api/audit-results',
      tags: [AUDIT],
      summary: 'List audit results with filters / sort / pagination',
      request: { query: ListQuerySchema },
      responses: {
        200: {
          description: 'Paged list',
          content: {
            'application/json': {
              schema: z.object({
                items: z.array(AuditResultRef),
                total: z.number().int(),
                page: z.number().int(),
                pageSize: z.number().int(),
              }),
            },
          },
        },
        ...common,
      },
    });

    registerRoute({
      method: 'post',
      path: '/api/audit-results',
      tags: [AUDIT],
      summary: 'Create a new audit result (L3+/Admin)',
      request: {
        body: { content: { 'application/json': { schema: CreateAuditResultSchema } } },
      },
      responses: {
        201: {
          description: 'Created',
          content: { 'application/json': { schema: AuditResultRef } },
        },
        ...common,
        ...err(400, 'Validation error'),
      },
    });

    registerRoute({
      method: 'get',
      path: '/api/audit-results/{id}',
      tags: [AUDIT],
      summary: 'Get by id',
      request: { params: z.object({ id: z.string() }) },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: AuditResultRef } } },
        ...err(404, 'Not found'),
        ...common,
      },
    });

    registerRoute({
      method: 'patch',
      path: '/api/audit-results/{id}',
      tags: [AUDIT],
      summary: 'Update editable fields (L2+/Admin)',
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { 'application/json': { schema: UpdateFieldsSchema } } },
      },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: AuditResultRef } } },
        ...err(400, 'Validation error'),
        ...err(404, 'Not found'),
        ...common,
      },
    });

    registerRoute({
      method: 'delete',
      path: '/api/audit-results/{id}',
      tags: [AUDIT],
      summary: 'Delete audit result (Admin only)',
      request: { params: z.object({ id: z.string() }) },
      responses: { 204: { description: 'Deleted' }, ...err(404, 'Not found'), ...common },
    });

    registerRoute({
      method: 'patch',
      path: '/api/audit-results/{id}/status',
      tags: [AUDIT],
      summary: 'Change status (L2+/Admin)',
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { 'application/json': { schema: UpdateStatusSchema } } },
      },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: AuditResultRef } } },
        ...err(404, 'Not found'),
        ...common,
      },
    });

    registerRoute({
      method: 'patch',
      path: '/api/audit-results/{id}/severity',
      tags: [AUDIT],
      summary: 'Change severity (L3+/Admin)',
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { 'application/json': { schema: ChangeSeveritySchema } } },
      },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: AuditResultRef } } },
        ...err(404, 'Not found'),
        ...common,
      },
    });

    registerRoute({
      method: 'post',
      path: '/api/audit-results/{id}/confirm',
      tags: [AUDIT],
      summary: 'Confirm final (L3+/Admin)',
      request: { params: z.object({ id: z.string() }) },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: AuditResultRef } } },
        ...err(404, 'Not found'),
        ...common,
      },
    });

    registerRoute({
      method: 'get',
      path: '/api/audit-results/{id}/comments',
      tags: [AUDIT],
      summary: 'List comments',
      request: { params: z.object({ id: z.string() }) },
      responses: { 200: { description: 'OK' }, ...err(404, 'Not found'), ...common },
    });

    registerRoute({
      method: 'post',
      path: '/api/audit-results/{id}/comments',
      tags: [AUDIT],
      summary: 'Add comment (L2+/Admin)',
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { 'application/json': { schema: AddCommentSchema } } },
      },
      responses: { 201: { description: 'Created' }, ...err(404, 'Not found'), ...common },
    });

    registerRoute({
      method: 'get',
      path: '/api/audit-results/{id}/history',
      tags: [AUDIT],
      summary: 'List audit log entries for a result',
      request: { params: z.object({ id: z.string() }) },
      responses: { 200: { description: 'OK' }, ...common },
    });

    registerRoute({
      method: 'get',
      path: '/api/audit-results/categories',
      tags: [AUDIT],
      summary: 'Distinct categories (for filter UI)',
      responses: { 200: { description: 'List of category strings' }, ...common },
    });

    // ---- Users ----
    registerRoute({
      method: 'get',
      path: '/api/users',
      tags: [USERS],
      summary: 'List users (Admin)',
      responses: {
        200: {
          description: 'OK',
          content: { 'application/json': { schema: z.array(UserRef) } },
        },
        ...common,
      },
    });
    registerRoute({
      method: 'post',
      path: '/api/users',
      tags: [USERS],
      summary: 'Create user (Admin)',
      request: { body: { content: { 'application/json': { schema: CreateUserSchema } } } },
      responses: {
        201: { description: 'OK', content: { 'application/json': { schema: UserRef } } },
        ...err(409, 'Duplicate email'),
        ...common,
      },
    });
    registerRoute({
      method: 'patch',
      path: '/api/users/{id}',
      tags: [USERS],
      summary: 'Update name/email (Admin)',
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { 'application/json': { schema: UpdateUserSchema } } },
      },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: UserRef } } },
        ...common,
      },
    });
    registerRoute({
      method: 'delete',
      path: '/api/users/{id}',
      tags: [USERS],
      summary: 'Delete user (Admin)',
      request: { params: z.object({ id: z.string() }) },
      responses: { 204: { description: 'Deleted' }, ...common },
    });
    registerRoute({
      method: 'patch',
      path: '/api/users/{id}/role',
      tags: [USERS],
      summary: 'Change role (Admin)',
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { 'application/json': { schema: ChangeRoleSchema } } },
      },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: UserRef } } },
        ...common,
      },
    });
    registerRoute({
      method: 'patch',
      path: '/api/users/{id}/active',
      tags: [USERS],
      summary: 'Activate/deactivate user (Admin)',
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { 'application/json': { schema: SetActiveSchema } } },
      },
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: UserRef } } },
        ...common,
      },
    });

    // ---- Calculators ----
    registerRoute({
      method: 'post',
      path: '/api/calculators/risk',
      tags: [CALC],
      summary: 'Risk score calculator',
      request: { body: { content: { 'application/json': { schema: RiskInputSchema } } } },
      responses: { 200: { description: 'Risk result' }, ...common },
    });
    registerRoute({
      method: 'post',
      path: '/api/calculators/sla',
      tags: [CALC],
      summary: 'SLA deadline + status calculator',
      request: { body: { content: { 'application/json': { schema: SlaInputSchema } } } },
      responses: { 200: { description: 'SLA result' }, ...common },
    });
    registerRoute({
      method: 'post',
      path: '/api/calculators/compliance',
      tags: [CALC],
      summary: 'Compliance percentage calculator',
      request: {
        body: { content: { 'application/json': { schema: ComplianceInputSchema } } },
      },
      responses: { 200: { description: 'Compliance result' }, ...common },
    });

    // ---- Dashboard ----
    registerRoute({
      method: 'get',
      path: '/api/dashboard/stats',
      tags: [DASH],
      summary: 'Dashboard aggregated stats',
      request: { query: z.object({ days: z.coerce.number().int().min(1).max(365).optional() }) },
      responses: { 200: { description: 'DashboardStats' }, ...common },
    });

    registered = true;
  }

  return buildOpenApiDocument();
}
