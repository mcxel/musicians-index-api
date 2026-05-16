export type AssetTruthType = "artist" | "billboard" | "article" | "sponsor" | "news" | "video";

export type AssetTruthStatus =
  | "placeholder"
  | "user-uploaded"
  | "generated"
  | "live-feed"
  | "sponsor-owned"
  | "article-owned";

export type AssetOwnership = "platform" | "artist" | "sponsor" | "editorial" | "unknown";

export interface AssetTruthRecord {
  assetId: string;
  type: AssetTruthType;
  source: string;
  ownership: AssetOwnership;
  status: AssetTruthStatus;
  route?: string;
  updatedAt: string;
}

class AssetTruthRegistry {
  private readonly records = new Map<string, AssetTruthRecord>();

  upsert(record: Omit<AssetTruthRecord, "updatedAt">): AssetTruthRecord {
    const normalized: AssetTruthRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    this.records.set(record.assetId, normalized);
    return normalized;
  }

  get(assetId: string): AssetTruthRecord | undefined {
    return this.records.get(assetId);
  }

  list(): AssetTruthRecord[] {
    return Array.from(this.records.values());
  }

  listByStatus(status: AssetTruthStatus): AssetTruthRecord[] {
    return this.list().filter((record) => record.status === status);
  }

  placeholderReport() {
    const placeholders = this.listByStatus("placeholder");
    return {
      total: this.records.size,
      placeholderCount: placeholders.length,
      placeholders,
    };
  }
}

export const assetTruthRegistry = new AssetTruthRegistry();
