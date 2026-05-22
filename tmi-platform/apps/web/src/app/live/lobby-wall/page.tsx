'use client';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallGrid, { type LobbyRoom } from '@/components/live/LiveLobbyWallGrid';

const ALL_LIVE_ROOMS: LobbyRoom[] = [
  // Battles
  { id: 'b-street-rep', name: 'Street Rep Finals', performerName: 'Street Rep', type: 'battle', href: '/battles/b-street-rep', viewerCount: 5100, status: 'live', genre: 'Hip-Hop', prizePool: '$5,000' },
  { id: 'b-soul-bars', name: 'Soul Bars Open', performerName: 'Soul Bars', type: 'battle', href: '/battles/b-soul-bars', viewerCount: 2100, status: 'live', genre: 'R&B', prizePool: '$1,000' },
  { id: 'b-crown-run', name: 'Crown Run Weekly', performerName: 'Crown Run', type: 'battle', href: '/battles/b-crown-run', viewerCount: 3200, status: 'live', genre: 'Hip-Hop', prizePool: '$2,000' },
  { id: 'b-mic-clash', name: 'Mic Clash Arena', performerName: 'Mic Clash', type: 'battle', href: '/battles/b-mic-clash', viewerCount: 1890, status: 'live', genre: 'Rap', prizePool: '$800' },
  { id: 'b-neon-crown', name: 'Neon vs Crown', performerName: 'Neon Verse', type: 'battle', href: '/battles/b-neon-crown', viewerCount: 1840, status: 'live', genre: 'Hip-Hop', prizePool: '$500' },
  // Dance-offs & Joke-offs (connected to battle billboard)
  { id: 'b-dance-showdown', name: 'Dance-Off Showdown', performerName: 'Dance Showdown', type: 'battle', href: '/battles/b-dance-showdown', viewerCount: 3100, status: 'live', genre: 'Dance', prizePool: '$1,500' },
  { id: 'b-joke-off-live', name: 'Joke-Off Live', performerName: 'Comedy Clash', type: 'battle', href: '/battles/b-joke-off', viewerCount: 1760, status: 'live', genre: 'Comedy', prizePool: '$800' },
  // Ciphers
  { id: 'c-open-flow', name: 'Open Flow Cypher', performerName: 'Open Flow', type: 'cypher', href: '/cypher/c-open-flow', viewerCount: 2340, status: 'live', genre: 'All Styles' },
  { id: 'c-latin-flow', name: 'Latin Flow Cypher', performerName: 'Latin Flow', type: 'cypher', href: '/cypher/c-latin-flow', viewerCount: 1720, status: 'live', genre: 'Latin' },
  { id: 'mc-fire-round', name: 'Fire Round Mini', performerName: 'Fire Round', type: 'mini-cypher', href: '/cypher/mc-fire-round', viewerCount: 410, status: 'live', genre: 'Hip-Hop' },
  { id: 'c-trap-lab', name: 'Trap Lab Cypher', performerName: 'Trap Lab', type: 'cypher', href: '/cypher/c-trap-lab', viewerCount: 1180, status: 'live', genre: 'Trap' },
  // Challenges
  { id: 'ch-singer-idol', name: 'Singer Idol Round', performerName: 'Singer Idol', type: 'challenge', href: '/challenges/ch-singer-idol', viewerCount: 4200, status: 'live', genre: 'Pop', prizePool: '$3,000' },
  { id: 'ch-rapper-weekly', name: 'Weekly Rapper Challenge', performerName: 'Rapper Weekly', type: 'challenge', href: '/challenges/ch-rapper-weekly', viewerCount: 2800, status: 'live', genre: 'Hip-Hop', prizePool: '$2,500' },
  { id: 'ch-dance-showdown', name: 'Dance Showdown', performerName: 'Dance Showdown', type: 'challenge', href: '/challenges/ch-dance-showdown', viewerCount: 3100, status: 'live', genre: 'Dance', prizePool: '$1,000' },
  // Games
  { id: 'g-monday-stage', name: 'Monday Night Stage', performerName: 'Monday Stage', type: 'game', href: '/live/rooms/monday-night-stage', viewerCount: 4200, status: 'live', prizePool: '$3,500' },
  { id: 'g-world-dance', name: 'World Dance Party', performerName: 'World Dance', type: 'game', href: '/live/rooms/world-dance-party', viewerCount: 5800, status: 'live', prizePool: '$4,000' },
  { id: 'g-monthly-idol', name: 'Monthly Idol', performerName: 'Monthly Idol', type: 'game', href: '/live/rooms/monthly-idol', viewerCount: 3100, status: 'live', prizePool: '$5,000' },
  { id: 'g-dealer-feud', name: 'Dealer Feud 1000', performerName: 'Dealer Feud', type: 'game', href: '/live/rooms/dealer-feud-1000', viewerCount: 2400, status: 'live', prizePool: '$1,000' },
  // More live rooms
  { id: 'l-bass-king', name: 'Bass Kingdom', performerName: 'Bass King', type: 'live', href: '/live/rooms/bass-kingdom', viewerCount: 1350, status: 'live', genre: 'Electronic' },
  { id: 'l-gospel-circle', name: 'Gospel Circle', performerName: 'Gospel Circle', type: 'live', href: '/cypher/c-gospel', viewerCount: 630, status: 'live', genre: 'Gospel' },
];

export default function AllLiveLobbyWallPage() {
  return (
    <>
      <GlobalTopNavRail />
      <LiveLobbyWallGrid
        rooms={ALL_LIVE_ROOMS}
        title="All Live Stations"
        accentColor="#00FF88"
        typeLabel="ALL LIVE"
      />
    </>
  );
}
