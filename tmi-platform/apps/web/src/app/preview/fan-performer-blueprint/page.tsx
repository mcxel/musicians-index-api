"use client";
 
import TMILiveRoomExperience from "@/components/shell/TMILiveRoomExperience";

const MOCK_MESSAGES = [
  { id: '1', user: 'QueenV', text: 'THIS IS FIRE', ts: 'just now' },
  { id: '2', user: 'BeatKing', text: 'Marceld never misses!', ts: 'just now' },
  { id: '3', user: 'LoyalFan23', text: 'The energy is crazy!!!', ts: 'just now' },
  { id: '4', user: 'DJStorm', text: 'Dropping that new beat next!', ts: 'just now' },
  { id: '5', user: 'RealMC', text: 'Who is in the lobby?', ts: 'just now' },
  { id: '6', user: 'StarGirl', text: 'I sent a gift!', ts: 'just now' },
  { id: '7', user: 'HipHopHead', text: '4K quality is insane!!!', ts: 'just now' }
];

const MOCK_ROOMS = [
  { name: 'Cypher Circle', count: 4231, href: '/rooms/cypher' },
  { name: 'Beat Battle Arena', count: 2156, href: '/rooms/battle-arena' },
  { name: 'World Dance Party', count: 8742, href: '/rooms/world-dance-party' }
];

const MOCK_FRIENDS = [
  { name: 'JayPaul', status: 'In Lobby' },
  { name: 'MicahMillion', status: 'Watching Live' },
  { name: 'ProdigyBeats', status: 'In Studio' }
];

export default function FanPerformerBlueprintPreviewPage() {
  return (
    <main data-testid="fan-performer-blueprint-page" style={{ height: "100vh", overflow: "hidden" }}>
      <TMILiveRoomExperience
        roomId="thunder-dome-live"
        roomTitle="MarcelD Live in Thunder Dome"
        performerName="Marceld"
        performerSlug="marceld"
        genre="Hip Hop"
        viewerCount={12847}
        isLive={true}
        quality="4K"
        userName="MarcelD"
        userTier="Diamond"
        userLevel={87}
        userXp={12450}
        userXpMax={25000}
        userPoints={12450}
        userCoins={8670}
        accentColor="#00FFFF"
        chatMessages={MOCK_MESSAGES}
        roomsNearby={MOCK_ROOMS}
        friendsOnline={MOCK_FRIENDS}
      />
    </main>
  );
}
