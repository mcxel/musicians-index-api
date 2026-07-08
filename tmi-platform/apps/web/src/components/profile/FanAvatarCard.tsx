'use client';

import React, { useEffect, useState } from 'react';
import { AvatarSystemEngine, AvatarProfile } from '@/lib/avatar/AvatarSystemEngine';

export default function FanAvatarCard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<AvatarProfile | null>(null);

  useEffect(() => {
    AvatarSystemEngine.loadUserAvatar(userId).then(setProfile);
  }, [userId]);

  if (!profile) return <div style={{ color: 'var(--cyan)', fontFamily: 'var(--font-orbitron)' }}>[LOADING AVATAR DATA...]</div>;

  return (
    <div style={{
      border: `1px solid ${profile.hexColor}`,
      padding: '16px',
      borderRadius: '12px',
      background: 'rgba(0,0,0,0.8)',
      fontFamily: 'var(--font-orbitron)',
      boxShadow: `0 0 15px ${profile.hexColor}33`
    }}>
      <h3 style={{ color: profile.hexColor, margin: '0 0 8px 0', textTransform: 'uppercase' }}>
        {profile.isVerified ? '✅ ' : ''}{profile.equippedTitle}
      </h3>
      <div style={{ color: '#fff', fontSize: '12px', marginBottom: '12px', letterSpacing: '0.1em' }}>
        MODEL: {profile.baseModel.replace('_', ' ')}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {profile.cosmetics.map(item => (
          <span key={item} style={{
            background: '#222', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: 'var(--gold)'
          }}>
            {item.replace('cosmetic_', '').toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}