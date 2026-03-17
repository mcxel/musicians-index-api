// Script Engine - Minimal Engine
import type { Script, ScriptConfig } from './types';

export class ScriptEngine {
  private scripts = new Map<string, Script>();

  load(config: ScriptConfig): Script {
    const script: Script = { id: config.id, config, loaded: true };
    this.scripts.set(config.id, script);
    return script;
  }

  unload(id: string): void {
    this.scripts.delete(id);
  }

  get(id: string): Script | undefined {
    return this.scripts.get(id);
  }

  getLoaded(): Script[] {
    return Array.from(this.scripts.values()).filter(s => s.loaded);
  }
}

export default ScriptEngine;
