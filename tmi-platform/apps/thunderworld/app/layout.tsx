import type { Metadata } from 'next';
export const metadata: Metadata = { title: { template: '%s | Thunder World', default: 'Thunder World' } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang='en'><body style={{ margin: 0, background: '#080810', color: '#f0f0f0', fontFamily: 'system-ui, sans-serif' }}>{children}</body></html>;
}
