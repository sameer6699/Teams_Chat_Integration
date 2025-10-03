import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Teams Chat Integration',
  description: 'A modern Teams-style chat application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
