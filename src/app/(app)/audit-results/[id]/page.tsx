import Link from 'next/link';
import { notFound } from 'next/navigation';
import { container } from '@/core/container';
import { requireAction } from '@/core/rbac/require';
import { canDo } from '@/core/rbac/permissions';
import { NotFoundError } from '@/core/errors';
import { SeverityChip, StatusChip } from '@/shared/design/chips';
import { StatusSelect } from '@/features/audit-results/ui/status-select';
import { SeveritySelect } from '@/features/audit-results/ui/severity-select';
import { CommentForm } from '@/features/audit-results/ui/comment-form';
import { ConfirmButton } from '@/features/audit-results/ui/confirm-button';
import { HistoryList } from '@/features/audit-log/ui/history-list';

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
  const [comments, history] = await Promise.all([
    container.auditResults.listComments(id),
    container.auditLog.listForEntity('AuditResult', id),
  ]);

  const role = session.user.role;
  const canChangeStatus = canDo(role, 'auditResults.updateStatus');
  const canChangeSeverity = canDo(role, 'auditResults.changeSeverity');
  const canConfirm = canDo(role, 'auditResults.confirmFinal');
  const canComment = canDo(role, 'comments.add');

  return (
    <div className="stack-lg">
      <div>
        <Link
          href="/audit-results"
          style={{ fontSize: 12, color: 'var(--text-meta)', textDecoration: 'none' }}
        >
          ← К списку
        </Link>
        <div className="page-head" style={{ marginTop: 8, marginBottom: 8 }}>
          <div className="head-left">
            <h1>{result.title}</h1>
            <div className="subtle">
              ID:{' '}
              <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                {result.id}
              </span>
            </div>
          </div>
          <div className="head-actions">
            <SeverityChip value={result.severity} />
            <StatusChip value={result.status} />
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="surface surface-padded">
          <h2 className="card-title">Описание</h2>
          <p
            style={{
              marginTop: 12,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-line',
              fontSize: 14,
            }}
          >
            {result.description}
          </p>
        </div>

        <div className="surface surface-padded">
          <h2 className="card-title">Атрибуты</h2>
          <div className="attr-grid" style={{ marginTop: 12 }}>
            <Row label="Система" value={result.system.name} />
            <Row label="Категория" value={result.category} />
            <Row label="Ответственный" value={result.assignee?.name ?? '—'} />
            <Row label="Обнаружено" value={fmtDate(result.foundAt)} />
            <Row label="Плановый срок" value={fmtDate(result.dueAt)} />
            <Row label="Устранено" value={fmtDate(result.resolvedAt)} />
            <Row label="Риск-скор" value={<span className="num">{result.riskScore}</span>} />
          </div>
        </div>
      </div>

      {(canChangeStatus || canChangeSeverity || canConfirm) && (
        <div className="surface surface-padded">
          <h2 className="card-title">Действия</h2>
          <div
            className="row"
            style={{
              flexWrap: 'wrap',
              gap: 24,
              marginTop: 14,
              alignItems: 'flex-start',
            }}
          >
            {canChangeStatus && (
              <div>
                <div className="label-micro" style={{ marginBottom: 6 }}>
                  Статус
                </div>
                <StatusSelect id={result.id} current={result.status} />
              </div>
            )}
            {canChangeSeverity && (
              <div>
                <div className="label-micro" style={{ marginBottom: 6 }}>
                  Критичность
                </div>
                <SeveritySelect id={result.id} current={result.severity} />
              </div>
            )}
            {canConfirm && (
              <div>
                <div className="label-micro" style={{ marginBottom: 6 }}>
                  Финальное решение
                </div>
                <ConfirmButton id={result.id} disabled={result.status === 'CONFIRMED'} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="surface surface-padded">
          <h2 className="card-title">Комментарии ({comments.length})</h2>
          <div style={{ marginTop: 12 }}>
            {comments.length === 0 && (
              <p style={{ color: 'var(--text-meta)', fontSize: 13 }}>Комментариев пока нет.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="comment">
                <div className="meta-line">
                  <span className="author">{c.author.name}</span>{' '}
                  <span style={{ fontFamily: 'ui-monospace, monospace' }}>{c.author.role}</span> ·{' '}
                  {fmtDateTime(c.createdAt)}
                </div>
                <p style={{ fontSize: 14, whiteSpace: 'pre-line', marginTop: 2 }}>{c.content}</p>
              </div>
            ))}
            {canComment && (
              <div style={{ marginTop: 16 }}>
                <CommentForm id={result.id} />
              </div>
            )}
          </div>
        </div>

        <div className="surface surface-padded">
          <h2 className="card-title">История изменений ({history.length})</h2>
          <div style={{ marginTop: 12 }}>
            <HistoryList entries={history} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="attr-row">
      <span className="attr-label">{label}</span>
      <span className="attr-value">{value}</span>
    </div>
  );
}
