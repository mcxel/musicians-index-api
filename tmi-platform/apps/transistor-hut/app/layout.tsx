import type { Metadata } from 'next';

export const metadata: Metadata = { title: { template: '%s | Transistor Hut', default: 'Transistor Hut' } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body style={{ margin: 0, background: '#080914', color: '#eceef6', fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
