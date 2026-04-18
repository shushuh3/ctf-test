import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-8">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">CFT Audit Portal</h1>
        <p className="mb-6 text-sm text-neutral-500">Вход для аналитиков</p>
        <LoginForm />
      </div>
    </main>
  );
}
