import type { Metadata } from 'next';
import './globals.css';
import '@/shared/design/app-shell.css';
import { Manrope } from 'next/font/google';
import { cn } from '@/lib/utils';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'CFT Audit Portal',
  description: 'Внутренний сервис для работы с результатами аудитов ИБ финсистем',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn(manrope.variable)}>
      <body>{children}</body>
    </html>
  );
}
