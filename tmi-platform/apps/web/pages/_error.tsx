import type { NextPageContext } from 'next';
import Link from 'next/link';

interface Props { statusCode?: number }

function Error({ statusCode }: Props) {
  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #1a0a2e 0%, #050510 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: '#fff', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 'clamp(48px,12vw,96px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, color: '#AA2DFF' }}>{statusCode ?? '?'}</div>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.2em', color: '#FF2DAA', textTransform: 'uppercase', margin: '16px 0 12px' }}>
          {statusCode === 404 ? 'SIGNAL LOST' : 'SOMETHING WENT WRONG'}
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 32 }}>
          {statusCode ? `A ${statusCode} error occurred.` : 'An unexpected error occurred.'}
        </p>
        <Link href="/home/1" style={{ display: 'inline-block', padding: '12px 32px', background: 'linear-gradient(90deg,#AA2DFF,#FF2DAA)', color: '#fff', fontWeight: 900, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 6, textDecoration: 'none' }}>
          RETURN TO LOBBY
        </Link>
      </div>
    </main>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
