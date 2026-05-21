/**
 * sponsor-contribution.entity.ts
 * Repo: apps/api/src/modules/contest/entities/sponsor-contribution.entity.ts
 */
export class SponsorContributionEntity {
  id: string;
  entryId: string;
  sponsorId: string;
  packageId: string;
  packageLabel: string;
  packageType: 'local' | 'major';
  amount: number;
  message?: string;
  adminNote?: string;
  status: 'invited' | 'pending_payment' | 'payment_received' | 'verified' | 'rejected';
  paymentReference?: string;
  paymentVerifiedAt?: Date;
  verifiedById?: string;
  createdAt: Date;
  updatedAt: Date;
}
