// tmi-platform/apps/web/src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <h2>404 - Not Found</h2>
      <p>Could not find the requested page.</p>
      <Link href="/" style={{ marginTop: '1rem', color: 'blue' }}>
        Return Home
      </Link>
    </div>
  );
}
