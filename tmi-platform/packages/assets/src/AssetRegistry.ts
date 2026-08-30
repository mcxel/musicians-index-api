// Asset registry handling for avatar and YoPho manifests
import * as fs from 'fs';
import * as path from 'path';

export interface ManifestEntry {
  assetId: string;
  version: number;
  contentHash: string;
  sourceFingerprint: string;
  displayName: string;
  category: string;
  status: string;
  // additional fields are allowed
  [key: string]: any;
}

export class AssetRegistry {
  private manifestPath: string;
  private entries: Map<string, ManifestEntry>; // key = sourceFingerprint

  constructor(manifestPath: string) {
    this.manifestPath = manifestPath;
    this.entries = new Map();
    this.load();
  }

  private load() {
    if (fs.existsSync(this.manifestPath)) {
      const raw = fs.readFileSync(this.manifestPath, 'utf-8');
      const data: ManifestEntry[] = JSON.parse(raw);
      for (const e of data) {
        this.entries.set(e.sourceFingerprint, e);
      }
    }
  }

  private save() {
    const arr = Array.from(this.entries.values());
    const json = JSON.stringify(arr, null, 2);
    fs.mkdirSync(path.dirname(this.manifestPath), { recursive: true });
    fs.writeFileSync(this.manifestPath, json, 'utf-8');
  }

  /**
   * Add a new asset or update an existing one based on source fingerprint.
   * Returns the updated/created entry.
   */
  public upsert(entry: Omit<ManifestEntry, 'assetId' | 'version'> & { assetId?: string; version?: number }): ManifestEntry {
    const existing = this.entries.get(entry.sourceFingerprint);
    if (existing) {
      if (existing.contentHash !== entry.contentHash) {
        existing.version += 1;
        existing.contentHash = entry.contentHash;
        existing.status = entry.status;
        Object.assign(existing, entry);
        this.entries.set(entry.sourceFingerprint, existing);
      }
      return existing;
    }
    const newEntry: ManifestEntry = {
      ...entry,
      assetId: entry.assetId ?? `generated_${Math.random().toString(36).substring(2, 10)}`,
      version: entry.version ?? 1,
    } as ManifestEntry;
    this.entries.set(entry.sourceFingerprint, newEntry);
    return newEntry;
  }

  /** Atomically persists the in-memory registry to disk. Call once after all upserts succeed. */
  public flush(): void {
    const arr = Array.from(this.entries.values());
    const json = JSON.stringify(arr, null, 2);
    fs.mkdirSync(path.dirname(this.manifestPath), { recursive: true });
    const tmpPath = `${this.manifestPath}.tmp`;
    fs.writeFileSync(tmpPath, json, 'utf-8');
    if (fs.existsSync(this.manifestPath)) {
      fs.unlinkSync(this.manifestPath);
    }
    fs.renameSync(tmpPath, this.manifestPath);
  }

  public getAll(): ManifestEntry[] {
    return Array.from(this.entries.values());
  }
}
