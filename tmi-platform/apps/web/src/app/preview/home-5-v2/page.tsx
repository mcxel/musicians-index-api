'use client';
/** Preview: Home 5 (Arena) wrapped in UniversalPlatformShell */
import UniversalPlatformShell from '@/components/shell/UniversalPlatformShell';
import Home5BattleCypherSurface from '@/components/home/Home5BattleCypherSurface';

export default function PreviewHome5() {
  return (
    <UniversalPlatformShell
      roomId="home-5-preview"
      title="TMI Arena"
      accentColor="#FF2DAA"
      centerStage={<Home5BattleCypherSurface />}
    />
  );
}
