'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from './actions';

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
        {state.fieldErrors?.email?.[0] && (
          <span className="field-err">{state.fieldErrors.email[0]}</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        {state.fieldErrors?.password?.[0] && (
          <span className="field-err">{state.fieldErrors.password[0]}</span>
        )}
      </div>

      {state.error && (
        <p role="alert" className="err">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? 'Вход…' : 'Войти'}
      </button>
    </form>
  );
}
