'use client';
import TMILiveRoomExperience from '@/components/shell/TMILiveRoomExperience';
import { LiveLobbyWallCanister } from '@/components/canisters/LiveLobbyWallCanister';
import { OnboardingMissionDock } from '@/components/onboarding/OnboardingMissionCard';
import { useOnboardingMissions } from '@/components/onboarding/useOnboardingMissions';
import { useTmiSession } from '@/hooks/SessionContext';

export default function PerformerHQV2Page() {
  const session = useTmiSession();
  const { missions, dismiss } = useOnboardingMissions();
  return (
    <>
      <TMILiveRoomExperience
        roomId="performer-hq-preview"
        roomTitle="Performer Command Deck v2 Preview"
        performerName={session.userName || 'Performer'}
        performerSlug="me"
        genre="All Genres"
        isLive={false}
        quality="4K"
        userId={session.userId}
        userName={session.userName || 'Performer'}
        userTier={session.userTier || 'Gold'}
        accentColor="#AA2DFF"
        lobbyWallSlot={<LiveLobbyWallCanister accentColor="#AA2DFF" maxRooms={4} />}
        roomsNearby={[
          { name: 'Battle Arena', count: 876, href: '/battles/live' },
          { name: 'Cypher Stage', count: 432, href: '/rooms/cypher' },
          { name: 'Monday Night Stage', count: 1204, href: '/rooms/monday-stage' },
        ]}
        friendsOnline={[
          { name: 'Kreach', status: 'In Studio' },
          { name: 'ZuriBloom', status: 'Live Now' },
          { name: 'NovaStar', status: 'In Lobby' },
        ]}
      />
      <OnboardingMissionDock missions={missions} onDismiss={dismiss} />
    </>
  );
}
