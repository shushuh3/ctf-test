/**
 * Узкий контракт записи в audit log. Реальная реализация — в Phase 5 (features/audit-log).
 * Здесь объявлен отдельно, чтобы audit-results.service зависел только от интерфейса,
 * а не от конкретной имплементации (dependency inversion).
 */
export type AuditLogEntry = {
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  diff: Record<string, readonly [unknown, unknown]>;
};

export interface AuditLogRecorder {
  record(entry: AuditLogEntry): Promise<void>;
}

/** No-op реализация — используется до того как появится реальный AuditLogService. */
export const noopAuditLog: AuditLogRecorder = {
  async record() {
    /* no-op */
  },
};
