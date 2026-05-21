// packages/payments/src/commerceSpine.ts
// Single unified commerce spine. ALL money flows through this.
// Stripe is the external payment rail. Internal wallet handles points + credits.

export type OrderType =
  | "TICKET_PURCHASE"      // event tickets
  | "TIP"                  // tip to artist
  | "SUBSCRIPTION"         // monthly platform subscription
  | "SPONSOR_SLOT"         // sponsor slot purchase
  | "AD_CAMPAIGN"          // advertiser campaign spend
  | "MERCH"                // merchandise
  | "AVATAR_ITEM"          // Julius / avatar item
  | "PREMIUM_UPGRADE"      // upgrade room to premium
  | "VIP_ACCESS"           // VIP front row ticket add-on
  | "PRIZE_CLAIM"          // prize fulfillment
  | "BOOKING_DEPOSIT"      // venue booking deposit
  | "GIFT"                 // gifting points to another user
  | "PROMO_REDEMPTION";    // promo code redemption

export type OrderStatus =
  | "DRAFT" | "INITIATED" | "PENDING" | "AUTHORIZED" | "PAID"
  | "FULFILLED" | "SETTLED" | "REFUNDED" | "DISPUTED" | "CANCELED";

export interface Order {
  orderId: string;
  type: OrderType;
  status: OrderStatus;
  buyerUserId: string;
  sellerUserId?: string;      // artist or venue receiving money
  amountCents: number;        // total charge
  platformFeeCents: number;   // TMI platform cut
  sellerNetCents: number;     // what seller receives
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  idempotencyKey: string;     // prevents double-charges — CRITICAL
  requiresBigAce: boolean;    // Platform Law #5: payouts need Big Ace approval
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Revenue split rules per order type
export const REVENUE_SPLITS: Record<OrderType, { platformPct: number; sellerPct: number; note: string }> = {
  TICKET_PURCHASE:    { platformPct:10, sellerPct:90, note:"Artist/venue gets 90%" },
  TIP:                { platformPct:5,  sellerPct:95, note:"Artist gets 95% of tips" },
  SUBSCRIPTION:       { platformPct:100,sellerPct:0,  note:"Platform keeps subscription" },
  SPONSOR_SLOT:       { platformPct:30, sellerPct:70, note:"Artist gets 70% of sponsor fees" },
  AD_CAMPAIGN:        { platformPct:100,sellerPct:0,  note:"Platform keeps ad revenue" },
  MERCH:              { platformPct:15, sellerPct:85, note:"Artist gets 85% of merch sales" },
  AVATAR_ITEM:        { platformPct:80, sellerPct:20, note:"Item creator gets 20%" },
  PREMIUM_UPGRADE:    { platformPct:100,sellerPct:0,  note:"Platform keeps upgrade fees" },
  VIP_ACCESS:         { platformPct:20, sellerPct:80, note:"Artist gets 80% of VIP fees" },
  PRIZE_CLAIM:        { platformPct:0,  sellerPct:100,note:"Prize goes 100% to winner" },
  BOOKING_DEPOSIT:    { platformPct:10, sellerPct:90, note:"Artist gets 90% after Platform fee" },
  GIFT:               { platformPct:5,  sellerPct:95, note:"Recipient gets 95% of gift value" },
  PROMO_REDEMPTION:   { platformPct:100,sellerPct:0,  note:"Platform absorbs promo cost" },
};

// Wallet ledger — tracks all internal money movements
export type WalletTransactionType =
  | "EARNING_TIP" | "EARNING_TICKET" | "EARNING_MERCH" | "EARNING_SPONSOR"
  | "EARNING_BOOKING" | "EARNING_PRIZE" | "POINTS_AWARD" | "POINTS_SPEND"
  | "PAYOUT_REQUESTED" | "PAYOUT_SENT" | "PAYOUT_FAILED"
  | "PLATFORM_FEE" | "REFUND_CREDIT" | "ADJUSTMENT_MANUAL";

export interface WalletTransaction {
  txId: string;
  walletId: string;
  type: WalletTransactionType;
  amountCents: number;         // positive = credit, negative = debit
  pointsDelta: number;         // positive = earn, negative = spend
  balanceAfterCents: number;   // running balance
  orderId?: string;
  note?: string;
  requiresBigAce: boolean;     // Platform Law #5
  approvedByBigAce?: boolean;
  approvedAt?: Date;
  createdAt: Date;
}

// Payout hold rules (Platform Law #5 — Big Ace gates all payouts)
export const PAYOUT_RULES = {
  minimumPayoutCents: 2500,    // $25 minimum
  holdDaysNew: 7,              // 7-day hold for new accounts
  requiresBigAce: true,        // ALL payouts require Big Ace review
  payoutSchedule: "WEEKLY",    // paid out weekly on Mondays
  stripeTransferDelay: 2,      // 2 business days for bank transfer
  maxDailyPayoutCents: 500000, // $5,000/day maximum
} as const;
