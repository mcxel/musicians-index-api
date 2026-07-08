'use client';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallGrid, { type LobbyRoom } from '@/components/live/LiveLobbyWallGrid';

const GAME_ROOMS: LobbyRoom[] = [
  { id: 'g-dealer-feud', name: 'Dealer Feud 1000', performerName: 'Dealer Feud', type: 'game', href: '/live/rooms/dealer-feud-1000', viewerCount: 2400, status: 'live', prizePool: '$1,000' },
  { id: 'g-monthly-idol', name: 'Monthly Idol', performerName: 'Monthly Idol', type: 'game', href: '/live/rooms/monthly-idol', viewerCount: 3100, status: 'live', prizePool: '$5,000' },
  { id: 'g-circles-squares', name: 'Circles & Squares', performerName: 'C&S Show', type: 'game', href: '/live/rooms/circles-and-squares', viewerCount: 1800, status: 'live', prizePool: '$1,000' },
  { id: 'g-monday-stage', name: "Monday Night Stage", performerName: 'Monday Stage', type: 'game', href: '/live/rooms/monday-night-stage', viewerCount: 4200, status: 'live', prizePool: '$3,500' },
  { id: 'g-world-dance', name: 'World Dance Party', performerName: 'World Dance', type: 'game', href: '/live/rooms/world-dance-party', viewerCount: 5800, status: 'live', prizePool: '$4,000' },
  { id: 'g-name-tune', name: 'Name That Tune', performerName: 'Name That Tune', type: 'game', href: '/live/rooms/name-that-tune', viewerCount: 2100, status: 'live', prizePool: '$2,000' },
];

export default function GamesLobbyWallPage() {
  return (
    <>
      <GlobalTopNavRail />
      <LiveLobbyWallGrid
        rooms={GAME_ROOMS}
        title="Games of the Week"
        accentColor="#FFD700"
        typeLabel="GAMES"
      />
    </>
  );
}
