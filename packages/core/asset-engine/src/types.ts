// Asset Engine - Minimal Types
export interface AssetConfig { id: string; url: string; type?: string; }
export interface Asset { id: string; config: AssetConfig; loaded: boolean; }
