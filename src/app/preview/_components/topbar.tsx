import { Bell, Sun } from 'lucide-react';

export function PreviewTopbar({ openCount }: { openCount: number }) {
  return (
    <header className="topbar">
      <div />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="kpi">
          <span className="kpi-icon">
            <Sun size={14} />
          </span>
          <span className="kpi-num">{openCount}</span>
          <span className="kpi-label">в работе</span>
        </div>
        <div className="actions">
          <button type="button" className="icon-btn" aria-label="Тема">
            <Sun size={18} />
          </button>
          <button type="button" className="icon-btn" aria-label="Уведомления">
            <Bell size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
