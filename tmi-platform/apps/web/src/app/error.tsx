'use client';

import React from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050815',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 560,
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 12,
          background: 'rgba(8,14,38,.92)',
          padding: 20,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, color: '#00E5FF' }}>Platform Error</h1>
        <p style={{ marginTop: 8, color: 'rgba(255,255,255,.8)', fontSize: 14 }}>
          Something went wrong while rendering this route.
        </p>

        <pre
          style={{
            marginTop: 14,
            background: 'rgba(0,0,0,.35)',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 8,
            padding: 12,
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#ffb4b4',
          }}
        >
          {error?.message || 'Unknown error'}
        </pre>

        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              border: '1px solid rgba(0,229,255,.6)',
              background: 'rgba(0,229,255,.15)',
              color: '#00E5FF',
              borderRadius: 8,
              fontWeight: 700,
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          <a
            href="/home/1"
            style={{
              border: '1px solid rgba(255,255,255,.35)',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 700,
              padding: '8px 14px',
              textDecoration: 'none',
            }}
          >
            Go Home
          </a>
        </div>
      </section>
    </main>
  );
}
