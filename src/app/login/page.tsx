import { UserRound } from 'lucide-react';
import './login.css';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="auth-root">
      <div className="auth-diamond">
        <div className="auth-inner">
          <div className="auth-avatar" aria-hidden>
            <UserRound size={56} strokeWidth={1.6} />
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
