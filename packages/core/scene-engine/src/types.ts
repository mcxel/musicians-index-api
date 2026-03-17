// Scene Engine - Minimal Types
export interface SceneConfig { id: string; name: string; assets?: string[]; }
export interface Scene { id: string; config: SceneConfig; active: boolean; }
