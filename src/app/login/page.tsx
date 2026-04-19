import { LoginForm } from './login-form';
import { Logo } from '@/shared/design/logo';

export default function LoginPage() {
  return (
    <main className="login-root">
      <div className="login-card app-root">
        <div style={{ marginBottom: 22 }}>
          <Logo />
        </div>
        <h1>Вход в систему</h1>
        <p className="sub">Аудит безопасности финансовых систем</p>
        <LoginForm />
      </div>
    </main>
  );
}
