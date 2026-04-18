import { Bell, Search, Settings } from 'lucide-react';

export function PreviewTopbar({ openCount }: { openCount: number }) {
  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={16} />
        <span>Найти аудит, систему, пользователя…</span>
        <kbd>⌘K</kbd>
      </div>

      <div className="actions">
        <div className="kpi">
          <span className="kpi-icon">
            <Bell size={14} />
          </span>
          <span className="kpi-num">{openCount}</span>
          <span className="kpi-label">в работе</span>
        </div>
        <button type="button" className="icon-btn" aria-label="Уведомления">
          <Bell size={18} />
          <span className="notif-dot" />
        </button>
        <button type="button" className="icon-btn" aria-label="Настройки">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
