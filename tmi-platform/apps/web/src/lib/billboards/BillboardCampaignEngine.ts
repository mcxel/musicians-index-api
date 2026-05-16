import {
  getBillboardBySlug,
  listArtistBillboards,
  listBillboards,
  type BillboardRecord,
  type BillboardStatus,
} from "@/lib/billboards/BillboardRegistry";

export interface BillboardCampaignSummary {
  active: number;
  public: number;
  draft: number;
  archived: number;
  replaced: number;
}

function statusSummary(items: BillboardRecord[]): BillboardCampaignSummary {
  return items.reduce<BillboardCampaignSummary>(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { active: 0, public: 0, draft: 0, archived: 0, replaced: 0 },
  );
}

export class BillboardCampaignEngine {
  static getCampaignSummary(): BillboardCampaignSummary {
    return statusSummary(listBillboards(true));
  }

  static getArtistCampaignSummary(artistSlug: string): BillboardCampaignSummary {
    return statusSummary(listArtistBillboards(artistSlug));
  }

  static getCampaignStatus(slug: string): BillboardStatus | "missing" {
    const found = getBillboardBySlug(slug);
    return found?.status ?? "missing";
  }

  static isPublicCampaign(slug: string): boolean {
    const status = this.getCampaignStatus(slug);
    return status === "public" || status === "active";
  }
}

export default BillboardCampaignEngine;
