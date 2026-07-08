'use client';
import TMILiveRoomExperience from '@/components/shell/TMILiveRoomExperience';
import { LiveLobbyWallCanister } from '@/components/canisters/LiveLobbyWallCanister';
import { OnboardingMissionDock } from '@/components/onboarding/OnboardingMissionCard';
import { useOnboardingMissions } from '@/components/onboarding/useOnboardingMissions';
import { useTmiSession } from '@/hooks/SessionContext';

export default function FanHQV2Page() {
  const session = useTmiSession();
  const { missions, dismiss } = useOnboardingMissions();
  return (
    <>
      <TMILiveRoomExperience
        roomId="fan-hq-preview"
        roomTitle="Fan Command Deck v2 Preview"
        performerName="TMI Platform"
        performerSlug="tmi"
        genre="All Genres"
        isLive={false}
        quality="4K"
        userId={session.userId}
        userName={session.userName || 'Fan'}
        userTier={session.userTier || 'Free'}
        accentColor="#00FFFF"
        lobbyWallSlot={<LiveLobbyWallCanister accentColor="#00FFFF" maxRooms={4} />}
        roomsNearby={[
          { name: 'Cypher Circle', count: 4231, href: '/rooms/cypher' },
          { name: 'Beat Battle Arena', count: 2156, href: '/battles/live' },
          { name: 'World Dance Party', count: 8742, href: '/rooms/world-dance-party' },
        ]}
        friendsOnline={[
          { name: 'JayPaul', status: 'In Lobby' },
          { name: 'MicahMillion', status: 'Watching Live' },
          { name: 'ProdigyBeats', status: 'In Studio' },
        ]}
      />
      <OnboardingMissionDock missions={missions} onDismiss={dismiss} />
    </>
  );
}
