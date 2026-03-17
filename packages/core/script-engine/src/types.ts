// Script Engine - Minimal Types
export interface ScriptConfig { id: string; name: string; cues?: string[]; }
export interface Script { id: string; config: ScriptConfig; loaded: boolean; }
