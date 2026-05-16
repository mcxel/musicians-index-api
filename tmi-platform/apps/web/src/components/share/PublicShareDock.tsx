'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import ShareWebsiteButton from './ShareWebsiteButton';

function isPublicShareSurface(pathname: string): boolean {
  return [
    '/home/',
    '/magazine',
    '/artists/',
    '/performers/',
    '/fan/',
    '/venues/',
    '/events',
    '/tickets',
    '/articles/',
    '/article/',
    '/rooms/',
  ].some((prefix) => pathname.startsWith(prefix));
}

export default function PublicShareDock() {
  const pathname = usePathname() || '/';
  const visible = useMemo(() => isPublicShareSurface(pathname), [pathname]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 14,
        bottom: 14,
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <ShareWebsiteButton path={pathname} />
    </div>
  );
}
