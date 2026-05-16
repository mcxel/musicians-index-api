/**
 * V2.4 Lobby Scanner Consumer
 * Reads the raw JSON payloads produced by the Python ai-vision microservice.
 */

export interface SceneGraphNode {
  id: string;
  type: 'LOW_SEAT' | 'HIGH_SEAT' | 'VIP_SEAT' | 'SOFA_SEAT' | 'DANCE_NODE' | 'HOST_NODE' | 'QUEUE_NODE' | 'SPECTATOR_NODE';
  anchor: { x: number; y: number; z: number };
}

export interface LobbySceneMetadata {
  lobbyId: string;
  theme: string;
  capacity: number;
  zones: Array<{ id: string; type: string }>;
  seats: SceneGraphNode[];
  navmesh: Array<{ polygon: number[][] }>;
  portals: Array<{ id: string; target: string; anchor: { x: number; y: number; z: number } }>;
  lights: Array<{ type: string; color: string; intensity: number }>;
}

// Implementation will use fs.readFileSync in Server Components / API Routes
// to ingest apps/web/src/data/lobbies/generated/[lobbyId].metadata.json