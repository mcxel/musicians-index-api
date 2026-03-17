// Sprite Engine - Types
export interface Sprite {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  frameCount: number;
}

export interface SpritePack {
  id: string;
  name: string;
  sprites: Sprite[];
}

export interface SpriteInstance {
  spriteId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  visible: boolean;
}
