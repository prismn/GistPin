import type { Metadata } from 'next';
import './globals.css';
import Layout from '@/components/Layout';

export const metadata: Metadata = {
  title: 'GistPin Analytics',
  description: 'Analytics dashboard for the GistPin platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning prevents React mismatch on the `dark` class
    // that Layout.tsx injects into <html> on the client.
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
