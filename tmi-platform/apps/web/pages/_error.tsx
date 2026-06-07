import React from 'react';
import type { NextPageContext } from 'next';

function ErrorFallback({ statusCode }: { statusCode: number }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050815', color: '#fff', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#fff' }}>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</p>
    </div>
  );
}

ErrorFallback.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorFallback;