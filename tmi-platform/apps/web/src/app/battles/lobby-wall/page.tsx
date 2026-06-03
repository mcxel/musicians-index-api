'use client';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallGrid, { type LobbyRoom } from '@/components/live/LiveLobbyWallGrid';

const BATTLE_ROOMS: LobbyRoom[] = [
  { id: 'b-neon-crown', name: 'Neon vs Crown', performerName: 'Neon Verse', type: 'battle', href: '/battles/b-neon-crown', viewerCount: 0, status: 'live', genre: 'Hip-Hop', prizePool: '$500' },
  { id: 'b-delta-wave', name: 'Delta vs Wave', performerName: 'Delta Flame', type: 'battle', href: '/battles/b-delta-wave', viewerCount: 0, status: 'live', genre: 'Trap', prizePool: '$250' },
  { id: 'b-soul-bars', name: 'Soul Bars Open', performerName: 'Soul Bars', type: 'battle', href: '/battles/b-soul-bars', viewerCount: 0, status: 'live', genre: 'R&B', prizePool: '$1,000' },
  { id: 'b-ghost-ink', name: 'Ghost Ink Battle', performerName: 'Ghost Ink', type: 'battle', href: '/battles/b-ghost-ink', viewerCount: 0, status: 'live', genre: 'Freestyle', prizePool: '$200' },
  { id: 'b-bass-king', name: 'Bass Kingdom', performerName: 'Bass King', type: 'battle', href: '/battles/b-bass-king', viewerCount: 0, status: 'live', genre: 'Electronic', prizePool: '$750' },
  { id: 'b-lyric-war', name: 'Lyric War Live', performerName: 'Lyric War', type: 'battle', href: '/battles/b-lyric-war', viewerCount: 0, status: 'starting', genre: 'Rap', prizePool: '$300' },
  { id: 'b-crown-run', name: 'Crown Run Weekly', performerName: 'Crown Run', type: 'battle', href: '/battles/b-crown-run', viewerCount: 0, status: 'live', genre: 'Hip-Hop', prizePool: '$2,000' },
  { id: 'b-fire-drop', name: 'Fire Drop Battle', performerName: 'Fire Drop', type: 'battle', href: '/battles/b-fire-drop', viewerCount: 0, status: 'live', genre: 'Drill', prizePool: '$400' },
  { id: 'b-street-rep', name: 'Street Rep Finals', performerName: 'Street Rep', type: 'battle', href: '/battles/b-street-rep', viewerCount: 0, status: 'live', genre: 'Hip-Hop', prizePool: '$5,000' },
  { id: 'b-vibe-check', name: 'Vibe Check', performerName: 'Vibe Check', type: 'battle', href: '/battles/b-vibe-check', viewerCount: 0, status: 'starting', genre: 'Pop', prizePool: '$150' },
  { id: 'b-bar-smith', name: 'Bar Smith Open', performerName: 'Bar Smith', type: 'battle', href: '/battles/b-bar-smith', viewerCount: 0, status: 'live', genre: 'Freestyle', prizePool: '$600' },
  { id: 'b-mic-clash', name: 'Mic Clash Arena', performerName: 'Mic Clash', type: 'battle', href: '/battles/b-mic-clash', viewerCount: 0, status: 'live', genre: 'Rap', prizePool: '$800' },
];

export default function BattlesLobbyWallPage() {
  return (
    <>
      <GlobalTopNavRail />
      <LiveLobbyWallGrid
        rooms={BATTLE_ROOMS}
        title="Battle Billboard Wall"
        accentColor="#FF2DAA"
        typeLabel="BATTLES"
      />
    </>
  );
}
