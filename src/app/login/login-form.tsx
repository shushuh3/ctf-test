'use client';

import { useActionState } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { loginAction, type LoginState } from './actions';

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="auth-form" aria-label="Вход">
      <div className="auth-field">
        <span className="auth-icon">
          <Mail size={16} />
        </span>
        <input
          name="email"
          type="email"
          placeholder="Email"
          aria-label="Email"
          required
          autoComplete="email"
        />
      </div>
      {state.fieldErrors?.email?.[0] && (
        <span className="auth-field-err">{state.fieldErrors.email[0]}</span>
      )}

      <div className="auth-field">
        <span className="auth-icon">
          <KeyRound size={16} />
        </span>
        <input
          name="password"
          type="password"
          placeholder="••••••••••"
          aria-label="Пароль"
          required
          autoComplete="current-password"
        />
      </div>
      {state.fieldErrors?.password?.[0] && (
        <span className="auth-field-err">{state.fieldErrors.password[0]}</span>
      )}

      <div className="auth-meta">
        <label>
          <input type="checkbox" name="remember" defaultChecked />
          Запомнить меня
        </label>
        <a className="muted" href="#" onClick={(e) => e.preventDefault()}>
          Забыли пароль?
        </a>
      </div>

      {state.error && (
        <p role="alert" className="auth-error">
          {state.error}
        </p>
      )}

      <button type="submit" className="auth-submit" disabled={pending}>
        {pending ? 'Вход…' : 'Войти'}
      </button>
    </form>
  );
}
