/**
 * BerntoutGlobal LLC — inter-module ownership contract.
 * Admin module (and authorized internal tools) use this to query ownership structure.
 */

export interface ProductOwnership {
  productId: string;
  productName: string;
  ownedBy: "bernoutglobal-llc";
  moduleId: string;
  domain: string;
  /** ISO date string of acquisition/creation */
  since: string;
  equityPercent: number;
}

export interface PayoutRecord {
  recipientId: string;
  recipientName: string;
  amount: number;
  currency: "USD";
  periodStart: string;
  periodEnd: string;
  issuedAt: string | null;
  status: "PENDING" | "ISSUED" | "FAILED";
}

export interface LLCServiceAdapter {
  getOwnershipRegistry(): Promise<ProductOwnership[]>;
  getPayoutSchedule(periodStart: string, periodEnd: string): Promise<PayoutRecord[]>;
  validatePartnerCredentials(partnerId: string, secret: string): Promise<boolean>;
}
