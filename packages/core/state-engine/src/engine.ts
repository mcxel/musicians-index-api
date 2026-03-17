// State Engine - Minimal Engine
import type { StateValue } from './types';

export class StateEngine {
  private store = new Map<string, StateValue>();

  get(key: string): StateValue | undefined {
    return this.store.get(key);
  }

  set(key: string, value: StateValue): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export default StateEngine;
