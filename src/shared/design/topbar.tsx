import { Bell } from 'lucide-react';
import { PathBar } from './path-bar';

export function AppTopbar() {
  return (
    <header className="topbar">
      <PathBar />
      <span className="spacer" />
      <div className="actions">
        <button type="button" className="icon-btn" aria-label="Уведомления">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
