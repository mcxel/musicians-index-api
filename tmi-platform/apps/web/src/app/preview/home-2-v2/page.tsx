'use client';
/** Preview: Home 2 (Magazine) wrapped in UniversalPlatformShell */
import UniversalPlatformShell from '@/components/shell/UniversalPlatformShell';
import Home2NewsDeskSurface from '@/components/home/Home2NewsDeskSurface';

export default function PreviewHome2() {
  return (
    <UniversalPlatformShell
      roomId="home-2-preview"
      title="TMI Magazine"
      accentColor="#FFD700"
      centerStage={<Home2NewsDeskSurface />}
    />
  );
}
