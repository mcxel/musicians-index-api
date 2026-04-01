'use client';
// apps/web/src/app/global-error.tsx
// Catastrophic error — replaces root layout entirely
// Copilot wires: Sentry.captureException
// VS Code proves: catastrophic error shows something, not blank page
import PlatformErrorShell from '@/components/error/PlatformErrorShell';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background:'#0a0a0a', color:'#fff', fontFamily:'sans-serif' }}>
        <PlatformErrorShell error={error} reset={reset} />
      </body>
    </html>
  );
}
