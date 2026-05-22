'use client';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallGrid, { type LobbyRoom } from '@/components/live/LiveLobbyWallGrid';

const CHALLENGE_ROOMS: LobbyRoom[] = [
  { id: 'ch-band-open', name: 'Band Battle Open', performerName: 'Band Open', type: 'challenge', href: '/challenges/ch-band-open', viewerCount: 1450, status: 'live', genre: 'Rock', prizePool: '$1,500' },
  { id: 'ch-rapper-weekly', name: 'Weekly Rapper Challenge', performerName: 'Rapper Weekly', type: 'challenge', href: '/challenges/ch-rapper-weekly', viewerCount: 2800, status: 'live', genre: 'Hip-Hop', prizePool: '$2,500' },
  { id: 'ch-dance-showdown', name: 'Dance Showdown', performerName: 'Dance Showdown', type: 'challenge', href: '/challenges/ch-dance-showdown', viewerCount: 3100, status: 'live', genre: 'Dance', prizePool: '$1,000' },
  { id: 'ch-singer-idol', name: 'Singer Idol Round', performerName: 'Singer Idol', type: 'challenge', href: '/challenges/ch-singer-idol', viewerCount: 4200, status: 'live', genre: 'Pop', prizePool: '$3,000' },
  { id: 'ch-comedian-open', name: 'Comedian Open Mic', performerName: 'Comedy Open', type: 'challenge', href: '/challenges/ch-comedian-open', viewerCount: 1760, status: 'live', genre: 'Comedy', prizePool: '$800' },
  { id: 'ch-dj-scratch', name: 'DJ Scratch Battle', performerName: 'DJ Scratch', type: 'challenge', href: '/challenges/ch-dj-scratch', viewerCount: 920, status: 'live', genre: 'DJ', prizePool: '$500' },
  { id: 'ch-producer-war', name: 'Producer War', performerName: 'Producer War', type: 'challenge', href: '/challenges/ch-producer-war', viewerCount: 1340, status: 'starting', genre: 'Beats', prizePool: '$2,000' },
  { id: 'ch-spoken-word', name: 'Spoken Word Slam', performerName: 'Spoken Slam', type: 'challenge', href: '/challenges/ch-spoken-word', viewerCount: 680, status: 'live', genre: 'Spoken Word', prizePool: '$300' },
  { id: 'ch-instrument-duel', name: 'Instrument Duel', performerName: 'Instrument Duel', type: 'challenge', href: '/challenges/ch-instrument-duel', viewerCount: 1120, status: 'live', genre: 'Instrumental', prizePool: '$750' },
];

export default function ChallengesLobbyWallPage() {
  return (
    <>
      <GlobalTopNavRail />
      <LiveLobbyWallGrid
        rooms={CHALLENGE_ROOMS}
        title="Challenge Lobby Wall"
        accentColor="#00FFFF"
        typeLabel="CHALLENGES"
      />
    </>
  );
}
