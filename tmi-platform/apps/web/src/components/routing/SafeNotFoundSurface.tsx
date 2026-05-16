import Link from 'next/link';

type Props = {
  title?: string;
  body?: string;
  homeHref?: string;
};

export default function SafeNotFoundSurface({
  title = 'Route Not Available',
  body = 'The route cannot be completed right now. Use a safe hub path below.',
  homeHref = '/'
}: Props) {
  return (
    <section style={{ border: '1px solid rgba(148,163,184,0.35)', borderRadius: 12, padding: 16, background: 'rgba(2,6,23,0.76)' }}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h3>
      <p style={{ marginTop: 0, color: 'rgba(255,255,255,0.66)' }}>{body}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={homeHref} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(0,255,255,0.5)', textDecoration: 'none', color: '#00FFFF' }}>Safe Home</Link>
        <Link href='/live/lobby' style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.5)', textDecoration: 'none', color: '#FF2DAA' }}>Live Lobby</Link>
      </div>
    </section>
  );
}
