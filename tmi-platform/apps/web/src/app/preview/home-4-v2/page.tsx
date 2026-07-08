'use client';
/** Preview: Home 4 (Marketplace) wrapped in UniversalPlatformShell */
import UniversalPlatformShell from '@/components/shell/UniversalPlatformShell';
import Home4MarketplacePage from '@/components/home/Home4MarketplacePage';

export default function PreviewHome4() {
  return (
    <UniversalPlatformShell
      roomId="home-4-preview"
      title="TMI Marketplace"
      accentColor="#AA2DFF"
      centerStage={<Home4MarketplacePage />}
    />
  );
}
