import type { NextPageContext } from 'next';

interface ErrorPageProps {
  statusCode?: number;
}

export default function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050815', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h1 style={{ fontSize: 64, margin: '0 0 16px', color: statusCode === 404 ? '#00E5FF' : '#ff4444' }}>
          {statusCode ?? 'Error'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>
          {statusCode === 404 ? 'Page not found' : 'An error occurred'}
        </p>
        <a href="/home/1" style={{ background: '#00E5FF', color: '#050815', padding: '12px 28px', borderRadius: 24, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
          Return to Lobby
        </a>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorPageProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
