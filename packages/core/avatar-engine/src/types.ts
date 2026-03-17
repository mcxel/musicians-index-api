// Avatar Engine - Types
export interface Avatar {
  id: string;
  name: string;
  ownerId: string;
  rig: AvatarRig;
  expressions: string[];
  animations: string[];
  sprites: string[];
}

export interface AvatarRig {
  head: string;
  face: string;
  mouth: string;
  eyes: string;
  body: string;
}

export interface AvatarInstance {
  avatarId: string;
  sceneId: string;
  position: { x: number; y: number; z: number };
  rotation: number;
}
