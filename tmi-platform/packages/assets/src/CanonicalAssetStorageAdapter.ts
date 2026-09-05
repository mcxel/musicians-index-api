// Stub storage adapter – local file copy (no remote upload)
import * as fs from 'fs';
import * as path from 'path';

export interface StorageResult {
  url: string; // public URL or file path
}

export abstract class CanonicalAssetStorageAdapter {
  abstract uploadThumbnail(localPath: string, destName: string): Promise<StorageResult>;
  abstract uploadGLB(localPath: string, destName: string): Promise<StorageResult>;
  abstract getUrl(key: string): string;
}

// Simple local implementation – stores under a "generated" folder within the package
export class LocalStorageAdapter extends CanonicalAssetStorageAdapter {
  private baseDir: string;

  constructor(baseDir: string) {
    super();
    this.baseDir = baseDir;
    fs.mkdirSync(this.baseDir, { recursive: true });
  }

  async uploadThumbnail(localPath: string, destName: string): Promise<StorageResult> {
    const dest = path.join(this.baseDir, 'thumbnails', destName);
    await this.copyFile(localPath, dest);
    return { url: dest };
  }

  async uploadGLB(localPath: string, destName: string): Promise<StorageResult> {
    const dest = path.join(this.baseDir, 'glb', destName);
    await this.copyFile(localPath, dest);
    return { url: dest };
  }

  getUrl(key: string): string {
    return path.join(this.baseDir, key);
  }

  private async copyFile(src: string, dest: string): Promise<void> {
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    await fs.promises.copyFile(src, dest);
  }
}
