'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { buildReturnUrl, getReturnLabel } from '@/lib/routing/ReturnPathResolver';
import { useFanAvatarLobbyStore } from '@/lib/avatars/FanAvatarLobbyStore';

export default function ReturnPathButton({
  fallbackHref,
  label: customLabel,
  onClick,
}: {
  fallbackHref?: string;
  label?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from');
  const returnToLobby = useFanAvatarLobbyStore((s) => s.returnToLobby);

  const isFromAvatarLobby = fromParam === 'fan-avatar-lobby' || fromParam === 'avatar-lobby';

  const handleClick = () => {
    if (isFromAvatarLobby) {
      returnToLobby();
    }
    onClick?.();
  };

  const defaultHref = isFromAvatarLobby ? '/fan/hub' : buildReturnUrl(pathname || '/');
  const href = fallbackHref || defaultHref;
  const label = customLabel || (isFromAvatarLobby ? '← Return to My Avatar Lobby' : getReturnLabel(pathname || '/'));

  return (
    <Link
      href={href}
      onClick={handleClick}
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: 8,
        border: isFromAvatarLobby ? '1px solid rgba(0,255,255,0.45)' : '1px solid rgba(148,163,184,0.45)',
        color: isFromAvatarLobby ? '#00FFFF' : '#e2e8f0',
        textDecoration: 'none',
        fontSize: 11,
        fontWeight: isFromAvatarLobby ? 800 : 600,
      }}
    >
      {label}
    </Link>
  );
}
