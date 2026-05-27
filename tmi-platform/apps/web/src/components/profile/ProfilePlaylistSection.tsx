'use client';

import { useEffect, useState } from 'react';
import ProfilePlaylist from '@/components/profile/ProfilePlaylist';

interface Props {
  profileSlug: string;
}

export default function ProfilePlaylistSection({ profileSlug }: Props) {
  const [isOwner, setIsOwner] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then((data: { authenticated?: boolean; user?: { id?: string } }) => {
        if (data.authenticated && data.user?.id) {
          const id = data.user.id.toLowerCase();
          setIsOwner(id === profileSlug.toLowerCase() || profileSlug.toLowerCase().startsWith(id));
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [profileSlug]);

  if (!ready) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <ProfilePlaylist
        writerId={profileSlug}
        editable={isOwner}
        limit={20}
        initialTitle="MY PLAYLIST"
        initialSkin="deep-space"
      />
    </div>
  );
}
