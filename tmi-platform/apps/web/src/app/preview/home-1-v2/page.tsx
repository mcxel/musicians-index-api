'use client';
/** Preview: Home 1 (Discovery/Cover) wrapped in UniversalPlatformShell */
import UniversalPlatformShell from '@/components/shell/UniversalPlatformShell';
import Home1CoverPage from '@/components/home/Home1CoverPage';
import { LiveLobbyWallCanister } from '@/components/canisters/LiveLobbyWallCanister';

export default function PreviewHome1() {
  return (
    <UniversalPlatformShell
      roomId="home-1-preview"
      title="TMI — Discovery"
      accentColor="#00FFFF"
      centerStage={<Home1CoverPage />}
      floatingWindows={<LiveLobbyWallCanister accentColor="#00FFFF" maxRooms={3} />}
    />
  );
}
