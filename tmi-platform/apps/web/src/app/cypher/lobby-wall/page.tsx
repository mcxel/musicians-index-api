'use client';
import GlobalTopNavRail from '@/components/home/GlobalTopNavRail';
import LiveLobbyWallGrid, { type LobbyRoom } from '@/components/live/LiveLobbyWallGrid';

const CYPHER_ROOMS: LobbyRoom[] = [
  { id: 'c-open-flow', name: 'Open Flow Cypher', performerName: 'Open Flow', type: 'cypher', href: '/cypher/c-open-flow', viewerCount: 2340, status: 'live', genre: 'All Styles' },
  { id: 'c-trap-lab', name: 'Trap Lab Cypher', performerName: 'Trap Lab', type: 'cypher', href: '/cypher/c-trap-lab', viewerCount: 1180, status: 'live', genre: 'Trap' },
  { id: 'c-rnb-circle', name: 'R&B Circle', performerName: 'R&B Circle', type: 'cypher', href: '/cypher/c-rnb-circle', viewerCount: 870, status: 'live', genre: 'R&B' },
  { id: 'mc-verse-drop', name: 'Verse Drop Mini', performerName: 'Verse Drop', type: 'mini-cypher', href: '/cypher/mc-verse-drop', viewerCount: 340, status: 'live', genre: 'Freestyle' },
  { id: 'c-soul-session', name: 'Soul Session', performerName: 'Soul Session', type: 'cypher', href: '/cypher/c-soul-session', viewerCount: 1560, status: 'live', genre: 'Soul' },
  { id: 'mc-quick-bars', name: 'Quick Bars Mini', performerName: 'Quick Bars', type: 'mini-cypher', href: '/cypher/mc-quick-bars', viewerCount: 220, status: 'starting', genre: 'Rap' },
  { id: 'c-electronic-circle', name: 'Electronic Circle', performerName: 'E-Circle', type: 'cypher', href: '/cypher/c-electronic', viewerCount: 980, status: 'live', genre: 'Electronic' },
  { id: 'mc-fire-round', name: 'Fire Round Mini', performerName: 'Fire Round', type: 'mini-cypher', href: '/cypher/mc-fire-round', viewerCount: 410, status: 'live', genre: 'Hip-Hop' },
  { id: 'c-latin-flow', name: 'Latin Flow Cypher', performerName: 'Latin Flow', type: 'cypher', href: '/cypher/c-latin-flow', viewerCount: 1720, status: 'live', genre: 'Latin' },
  { id: 'c-gospel-circle', name: 'Gospel Circle', performerName: 'Gospel Circle', type: 'cypher', href: '/cypher/c-gospel', viewerCount: 630, status: 'live', genre: 'Gospel' },
  { id: 'mc-two-bar', name: '2-Bar Challenge', performerName: '2-Bar MC', type: 'mini-cypher', href: '/cypher/mc-two-bar', viewerCount: 190, status: 'starting', genre: 'Freestyle' },
  { id: 'c-jazz-improv', name: 'Jazz Improv Cypher', performerName: 'Jazz Improv', type: 'cypher', href: '/cypher/c-jazz-improv', viewerCount: 540, status: 'live', genre: 'Jazz' },
];

export default function CypherLobbyWallPage() {
  return (
    <>
      <GlobalTopNavRail />
      <LiveLobbyWallGrid
        rooms={CYPHER_ROOMS}
        title="Cypher Lobby Wall"
        accentColor="#AA2DFF"
        typeLabel="CIPHERS"
      />
    </>
  );
}
