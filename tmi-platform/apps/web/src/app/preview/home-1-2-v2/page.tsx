'use client';
/** Preview: Home 1-2 (Billboard) wrapped in UniversalPlatformShell */
import UniversalPlatformShell from '@/components/shell/UniversalPlatformShell';
import { LiveLobbyWallCanister } from '@/components/canisters/LiveLobbyWallCanister';

export default function PreviewHome12() {
  return (
    <UniversalPlatformShell
      roomId="home-1-2-preview"
      title="TMI Billboard"
      accentColor="#FF2DAA"
      centerStage={
        <div style={{ background: '#030310', minHeight: '100%', padding: '16px' }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#FF2DAA', marginBottom: 12 }}>
            LIVE NOW — BILLBOARD WORLD
          </div>
          <LiveLobbyWallCanister accentColor="#FF2DAA" maxRooms={12} />
        </div>
      }
    />
  );
}
