'use client';
/** Preview: Home 3 (Live World) wrapped in UniversalPlatformShell — most important for live runtime */
import UniversalPlatformShell from '@/components/shell/UniversalPlatformShell';
import Home3LiveWorldSurface from '@/components/home/Home3LiveWorldSurface';
import WorldLobbySection from '@/components/home/WorldLobbySection';

export default function PreviewHome3() {
  return (
    <UniversalPlatformShell
      roomId="home-3-preview"
      title="TMI — Live World"
      accentColor="#FF2020"
      centerStage={
        <div style={{ background: '#030310', minHeight: '100%' }}>
          <Home3LiveWorldSurface />
          <WorldLobbySection />
        </div>
      }
    />
  );
}
