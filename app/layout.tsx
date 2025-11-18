import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Agentic Fetcher',
  description: 'A simple agent to fetch data from URLs',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
