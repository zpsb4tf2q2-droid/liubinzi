import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Next.js 14 Starter',
  description: 'A minimal App Router starter configured with Tailwind CSS and TypeScript.',
};

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-transparent antialiased`}>{children}</body>
    </html>
  );
}
