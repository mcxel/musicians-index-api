'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buildReturnUrl, getReturnLabel } from '@/lib/routing/ReturnPathResolver';

export default function ReturnPathButton() {
  const pathname = usePathname();
  const href = buildReturnUrl(pathname || '/');
  const label = getReturnLabel(pathname || '/');

  return (
    <Link href={href} style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.45)', color: '#e2e8f0', textDecoration: 'none', fontSize: 11 }}>
      {label}
    </Link>
  );
}
