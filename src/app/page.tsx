import { auth, signOut } from '@/core/auth/auth';

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold">CFT Audit Portal</h1>
        {session?.user ? (
          <>
            <p className="mt-2 text-sm text-neutral-500">
              Вы вошли как <strong>{session.user.name}</strong> ({session.user.email}) · роль{' '}
              <strong>{session.user.role}</strong>.
            </p>
            <p className="mt-6 text-sm text-neutral-500">
              Функциональные разделы (аудит-результаты, дашборд, калькуляторы, пользователи)
              появятся в следующих фазах.
            </p>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
              className="mt-6"
            >
              <button
                type="submit"
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
              >
                Выйти
              </button>
            </form>
          </>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">Сессия не найдена.</p>
        )}
      </div>
    </main>
  );
}
