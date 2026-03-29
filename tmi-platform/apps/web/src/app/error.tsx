'use client';
// apps/web/src/app/error.tsx
// Segment-level error boundary — catches runtime errors in page segments
// Copilot wires: PlatformErrorShell + Sentry.captureException
// VS Code proves: thrown error in page shows this, not white screen
import { useEffect } from 'react';
import { PlatformErrorShell } from '@/components/error/PlatformErrorShell';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Copilot: Sentry.captureException(error) here
    console.error('[Error boundary]', error);
  }, [error]);
  return <PlatformErrorShell reset={reset} />;
}
