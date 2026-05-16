export type LobbyZone = {
  id: string;
  label: string;
  zone_type: string;
  bounds: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  walkable: boolean;
};

export type LobbyGeneratedMetadata = {
  approved?: boolean;
  status?: "Approved" | string;
  lobbyId: string;
  theme: string;
  themeLabel: string;
  roomType: string;
  capacity: number;
  seatCount: number;
  walkZones: number;
  queueZone: boolean;
  mainScreen: boolean;
  hostStage: boolean;
  sourceAssetPath: string;
  segmentation: {
    image: string;
    themeKey: string;
    zones: LobbyZone[];
    layerCount: number;
  };
  depth: {
    ceilingHeight: number;
    roomDepth: number;
    stageDepth: number;
    verticality: string;
    layers: string[];
    image: string;
  };
  objects: string[];
  seatTypes: string[];
  navmesh: string[];
  portals: Array<{ id: string; target: string; enabled: boolean }>;
  lights: Array<{ id: string; kind: string; intensity: number }>;
  sceneGraph: {
    nodes: string[];
  };
};

export const LOBBY_METADATA_STATUS = "Approved" as const;
