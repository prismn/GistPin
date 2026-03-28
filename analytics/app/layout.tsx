import type { ReactNode } from 'react';
import Providers from '@/app/providers';

export const metadata = {
  title: 'GistPin Analytics',
  description: 'Analytics dashboard with cached chart data.',

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          background: '#eef2ff',
          background: '#f8fafc',
          color: '#111827',
        }}
      >
        {children}
import type { Metadata } from 'next';
import './globals.css';
import Layout from '@/components/Layout';

export const metadata: Metadata = {
  title: 'GistPin Analytics',
  description: 'Analytics dashboard for the GistPin platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, background: '#f8fafc' }}>
        <Providers>{children}</Providers>
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
