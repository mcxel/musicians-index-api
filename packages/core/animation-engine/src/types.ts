// Animation Engine - Minimal Types
export interface AnimationConfig { id: string; duration?: number; loop?: boolean; }
export interface Animation { id: string; config: AnimationConfig; playing: boolean; }
