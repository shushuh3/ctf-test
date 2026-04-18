'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { signIn } from '@/core/auth/auth';

const LoginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

export type LoginState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/',
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === 'CredentialsSignin') {
        return { error: 'Неверный email или пароль' };
      }
      return { error: 'Ошибка аутентификации. Попробуйте ещё раз' };
    }
    throw err; // NEXT_REDIRECT и прочие — пробрасываем
  }
}
