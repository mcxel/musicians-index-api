// Server-side only — Node.js fs. Never import this in client components.
import fs from 'fs';
import path from 'path';

const MEMORY_DIR = path.join(process.cwd(), '.tmi-data', 'agent-memory');

export type MemoryRecord = Record<string, string | number | boolean | null>;

function ensureDir(): void {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

export const AgentMemoryEngine = {
  read(agentId: string): MemoryRecord {
    try {
      const fp = path.join(MEMORY_DIR, `${agentId}.json`);
      if (!fs.existsSync(fp)) return {};
      return JSON.parse(fs.readFileSync(fp, 'utf-8')) as MemoryRecord;
    } catch {
      return {};
    }
  },

  write(agentId: string, data: MemoryRecord): boolean {
    try {
      ensureDir();
      fs.writeFileSync(path.join(MEMORY_DIR, `${agentId}.json`), JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch {
      return false;
    }
  },

  patch(agentId: string, updates: MemoryRecord): boolean {
    return this.write(agentId, { ...this.read(agentId), ...updates });
  },
};
