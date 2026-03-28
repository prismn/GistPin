import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          background: '#f8fafc',
          color: '#111827',
        }}
      >
        {children}
      </body>
    </html>
  );
}
