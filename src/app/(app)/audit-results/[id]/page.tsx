import Link from 'next/link';
import { notFound } from 'next/navigation';
import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import { canDo } from '@/core/rbac/permissions';
import { NotFoundError } from '@/core/errors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SeverityBadge, StatusBadge } from '@/features/audit-results/ui/badges';
import { StatusSelect } from '@/features/audit-results/ui/status-select';
import { SeveritySelect } from '@/features/audit-results/ui/severity-select';
import { CommentForm } from '@/features/audit-results/ui/comment-form';
import { ConfirmButton } from '@/features/audit-results/ui/confirm-button';

type PageProps = { params: Promise<{ id: string }> };

const fmtDate = (d: Date | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : '—');
const fmtDateTime = (d: Date) => new Date(d).toISOString().replace('T', ' ').slice(0, 16);

export default async function AuditResultDetailPage({ params }: PageProps) {
  const session = await requireAction('auditResults.read');
  const { id } = await params;

  let result;
  try {
    result = await container.auditResults.getById(id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const comments = await container.auditResults.listComments(id);

  const role = session.user.role;
  const canChangeStatus = canDo(role, 'auditResults.updateStatus');
  const canChangeSeverity = canDo(role, 'auditResults.changeSeverity');
  const canConfirm = canDo(role, 'auditResults.confirmFinal');
  const canComment = canDo(role, 'comments.add');

  return (
    <div className="space-y-6">
      <div>
        <Link href="/audit-results" className="text-sm text-neutral-500 hover:underline">
          ← К списку
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{result.title}</h1>
        <p className="text-sm text-neutral-500">
          ID: <span className="font-mono text-xs">{result.id}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Описание</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-line text-neutral-700">
            {result.description}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Атрибуты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Система" value={result.system.name} />
            <Row label="Категория" value={result.category} />
            <Row label="Критичность" value={<SeverityBadge value={result.severity} />} />
            <Row label="Статус" value={<StatusBadge value={result.status} />} />
            <Row label="Ответственный" value={result.assignee?.name ?? '—'} />
            <Row label="Обнаружено" value={fmtDate(result.foundAt)} />
            <Row label="Плановый срок" value={fmtDate(result.dueAt)} />
            <Row label="Устранено" value={fmtDate(result.resolvedAt)} />
            <Row label="Риск-скор" value={String(result.riskScore)} />
          </CardContent>
        </Card>
      </div>

      {(canChangeStatus || canChangeSeverity || canConfirm) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Действия</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
            {canChangeStatus && (
              <div>
                <div className="mb-2 text-xs font-medium text-neutral-500">Статус</div>
                <StatusSelect id={result.id} current={result.status} />
              </div>
            )}
            {canChangeSeverity && (
              <div>
                <div className="mb-2 text-xs font-medium text-neutral-500">Критичность</div>
                <SeveritySelect id={result.id} current={result.severity} />
              </div>
            )}
            {canConfirm && (
              <div>
                <div className="mb-2 text-xs font-medium text-neutral-500">Финальное решение</div>
                <ConfirmButton id={result.id} disabled={result.status === 'CONFIRMED'} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Комментарии ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.length === 0 && (
              <p className="text-sm text-neutral-500">Комментариев пока нет.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="text-xs text-neutral-500">
                  <span className="font-medium text-neutral-800">{c.author.name}</span>{' '}
                  <span className="font-mono">{c.author.role}</span> · {fmtDateTime(c.createdAt)}
                </div>
                <p className="text-sm whitespace-pre-line">{c.content}</p>
                <Separator />
              </div>
            ))}
            {canComment && (
              <>
                <div className="pt-2">
                  <CommentForm id={result.id} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">История изменений</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500">Появится в Phase 5 (feature: audit-log).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
