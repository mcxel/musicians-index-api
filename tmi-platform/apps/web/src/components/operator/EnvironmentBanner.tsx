'use client';
// EnvironmentBanner.tsx — Shows which environment the app is running in
// Copilot wires: process.env.NEXT_PUBLIC_ENVIRONMENT
// Proof: banner shows in staging/preview, hidden in production
export function EnvironmentBanner() {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'production';
  if (env === 'production') return null;
  const ENV_STYLES: Record<string, string> = {
    staging: 'background:#F4A800;color:#000',
    preview: 'background:#00A896;color:#fff',
    development: 'background:#E91E8C;color:#fff',
  };
  return (
    <div className="tmi-env-banner" style={{ cssText: ENV_STYLES[env] } as any}>
      {env.toUpperCase()} ENVIRONMENT — Not production
    </div>
  );
}
