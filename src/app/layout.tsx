import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
