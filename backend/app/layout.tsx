import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SOS IT Services API',
  description: 'API REST pour SOS IT Services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
