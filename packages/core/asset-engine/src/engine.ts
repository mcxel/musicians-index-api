// Asset Engine - Minimal Engine
import type { Asset, AssetConfig } from './types';

export class AssetEngine {
  private assets = new Map<string, Asset>();

  load(config: AssetConfig): Asset {
    const asset: Asset = { id: config.id, config, loaded: true };
    this.assets.set(config.id, asset);
    return asset;
  }

  unload(id: string): void {
    this.assets.delete(id);
  }

  get(id: string): Asset | undefined {
    return this.assets.get(id);
  }

  getLoaded(): Asset[] {
    return Array.from(this.assets.values()).filter(a => a.loaded);
  }
}

export default AssetEngine;
