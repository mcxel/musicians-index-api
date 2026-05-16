/**
 * UniversalCheckoutEngine
 * One checkout spine for all purchasable items.
 */

import type { CheckoutProductType } from "./CheckoutRoutingEngine";
import {
  resolveCheckoutProduct,
  validateCheckoutProduct,
  resolveProductMetadata,
} from "./CheckoutProductResolver";
import { buildCheckoutReceipt, getCheckoutReceiptByOrderId, type CheckoutReceipt } from "./CheckoutReceiptEngine";
import { buildStripeCheckoutSessionPayload, buildStripePaymentIntentPayload } from "./StripeCheckoutEngine";
import { calculateRevenueSplit, type RevenueSourceType } from "../revenue/RevenueSplitEngine";
import { recordRevenueLedgerEntry, getRevenueLedgerEntryByCheckoutId, type RevenueLedgerEntry } from "../revenue/RevenueLedgerEngine";
import {
  createPayoutFromLedgerEntry,
  getPayoutsByLedgerEntryId,
  type PayoutRecipientType,
  type PayoutRecord,
} from "../revenue/PayoutEngine";
import { normalizeSellerMetadata } from "./SellerMetadataNormalizer";

export type CheckoutStatus =
  | "draft"
  | "pending-payment"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type UniversalCheckoutSession = {
  checkoutId: string;
  orderId: string;
  customerId: string;
  productType: CheckoutProductType;
  productId: string;
  quantity: number;
  subtotalCents: number;
  platformFeeCents: number;
  taxCents: number;
  totalCents: number;
  status: CheckoutStatus;
  metadata: Record<string, string | number | boolean>;
  createdAtMs: number;
  receiptId?: string;
};

export type UniversalCheckoutResult = {
  checkout: UniversalCheckoutSession;
  receipt: CheckoutReceipt;
  ledgerEntry?: RevenueLedgerEntry;
  payouts: PayoutRecord[];
};

const sessions: UniversalCheckoutSession[] = [];
let checkoutCounter = 0;
let orderCounter = 0;

function toRevenueSourceType(productType: CheckoutProductType): RevenueSourceType {
  switch (productType) {
    case "subscription":
      return "subscription";
    case "ticket":
      return "ticket";
    case "beat":
      return "beat";
    case "sponsor-package":
      return "sponsor-package";
    case "artist-local-sponsor":
      return "artist-local-sponsor";
    case "venue-promotion":
      return "venue-promotion";
    case "merchant-promotion":
      return "merchant-promotion";
    case "article-ad":
      return "article-ad";
    case "contest-entry":
      return "contest-entry";
    default:
      return "custom";
  }
}

function toPayoutRecipientType(sellerType?: string): PayoutRecipientType | null {
  switch (sellerType) {
    case "artist":
      return "artist";
    case "venue":
      return "venue";
    case "merchant":
    case "sponsor":
      return "merchant";
    case "promoter":
      return "promoter";
    case "booking":
      return "booking";
    default:
      return null;
  }
}

function calculatePlatformFee(productType: CheckoutProductType, quantity: number): number {
  switch (productType) {
    case "subscription":
      return 0;
    case "ticket":
      return 0;
    case "beat":
      return Math.round(99 * quantity);
    case "sponsor-package":
      return Math.round(299 * quantity);
    case "artist-local-sponsor":
      return Math.round(199 * quantity);
    case "venue-promotion":
      return Math.round(99 * quantity);
    case "article-ad":
      return Math.round(149 * quantity);
    case "merchant-promotion":
      return Math.round(129 * quantity);
    case "nft":
      return Math.round(125 * quantity);
    case "store-product":
      return Math.round(79 * quantity);
    case "contest-entry":
      return Math.round(49 * quantity);
    case "custom-product":
      return Math.round(99 * quantity);
    default:
      return 0;
  }
}

function calculateTax(subtotalCents: number): number {
  return Math.round((subtotalCents * 825) / 10000);
}

export function createUniversalCheckout(input: {
  customerId: string;
  productType: CheckoutProductType;
  productId: string;
  quantity?: number;
}): {
  checkout: UniversalCheckoutSession;
  stripeSessionPayload: ReturnType<typeof buildStripeCheckoutSessionPayload>;
  stripePaymentIntentPayload: ReturnType<typeof buildStripePaymentIntentPayload>;
} {
  const record = resolveCheckoutProduct({
    productType: input.productType,
    productId: input.productId,
  });

  validateCheckoutProduct(record);

  const quantity = input.quantity ?? 1;
  if (quantity <= 0) throw new Error("Quantity must be positive");

  const subtotalCents = record.unitPriceCents * quantity;
  const platformFeeCents =
    (record.platformFeeCents ?? 0) * quantity + calculatePlatformFee(input.productType, quantity);
  const taxCents = record.taxable ? calculateTax(subtotalCents) : 0;
  const totalCents = subtotalCents + platformFeeCents + taxCents;

  const checkoutId = `universal-checkout-${++checkoutCounter}`;
  const orderId = `order-${++orderCounter}`;
  const metadata = resolveProductMetadata({
    productType: input.productType,
    productId: input.productId,
    customerId: input.customerId,
  });
  const sellerMetadata = normalizeSellerMetadata(metadata);

  const checkout: UniversalCheckoutSession = {
    checkoutId,
    orderId,
    customerId: input.customerId,
    productType: input.productType,
    productId: input.productId,
    quantity,
    subtotalCents,
    platformFeeCents,
    taxCents,
    totalCents,
    status: "pending-payment",
    metadata: {
      ...metadata,
      sellerId: sellerMetadata.sellerId,
      ...(sellerMetadata.sellerType ? { sellerType: sellerMetadata.sellerType } : {}),
    },
    createdAtMs: Date.now(),
  };

  sessions.unshift(checkout);

  const stripeSessionPayload = buildStripeCheckoutSessionPayload({
    checkoutId,
    customerId: input.customerId,
    productTitle: record.title,
    productType: input.productType,
    productId: input.productId,
    unitAmountCents: totalCents,
    quantity: 1,
    metadata: checkout.metadata,
  });

  const stripePaymentIntentPayload = buildStripePaymentIntentPayload({
    checkoutId,
    customerId: input.customerId,
    amountCents: totalCents,
    metadata: checkout.metadata,
  });

  return { checkout, stripeSessionPayload, stripePaymentIntentPayload };
}

export function markCheckoutPaid(checkoutId: string): UniversalCheckoutResult {
  const checkout = sessions.find((session) => session.checkoutId === checkoutId);
  if (!checkout) throw new Error(`Checkout ${checkoutId} not found`);

  if (checkout.status === "paid" && checkout.receiptId) {
    const receipt = getCheckoutReceiptByOrderId(checkout.orderId);
    const ledgerEntry = getRevenueLedgerEntryByCheckoutId(checkout.checkoutId);
    const payouts = ledgerEntry ? getPayoutsByLedgerEntryId(ledgerEntry.ledgerEntryId) : [];
    if (receipt) {
      return { checkout, receipt, ledgerEntry: ledgerEntry ?? undefined, payouts };
    }
  }

  checkout.status = "paid";

  const receipt = buildCheckoutReceipt({
    orderId: checkout.orderId,
    checkoutId: checkout.checkoutId,
    customerId: checkout.customerId,
    productType: checkout.productType,
    productId: checkout.productId,
    quantity: checkout.quantity,
    subtotalCents: checkout.subtotalCents,
    taxCents: checkout.taxCents,
    platformFeeCents: checkout.platformFeeCents,
    totalCents: checkout.totalCents,
  });

  checkout.receiptId = receipt.receiptId;

  const normalizedSellerMetadata = normalizeSellerMetadata(checkout.metadata);
  const split = calculateRevenueSplit({
    sourceType: toRevenueSourceType(checkout.productType),
    grossCents: checkout.subtotalCents,
  });

  const ledgerEntry = recordRevenueLedgerEntry({
    revenueSource: toRevenueSourceType(checkout.productType),
    customerId: checkout.customerId,
    sellerId: normalizedSellerMetadata.sellerId,
    sellerType: normalizedSellerMetadata.sellerType,
    productId: checkout.productId,
    grossCents: checkout.subtotalCents,
    subtotalCents: checkout.subtotalCents,
    platformFeeCents: checkout.platformFeeCents,
    taxCents: checkout.taxCents,
    totalCents: checkout.totalCents,
    split,
    orderId: checkout.orderId,
    checkoutId: checkout.checkoutId,
  });

  const payouts: PayoutRecord[] = [];
  const payoutRecipientType = toPayoutRecipientType(normalizedSellerMetadata.sellerType);
  if (payoutRecipientType && normalizedSellerMetadata.sellerId !== "platform") {
    const payout = createPayoutFromLedgerEntry({
      ledgerEntry,
      recipientId: normalizedSellerMetadata.sellerId,
      recipientType: payoutRecipientType,
    });
    if (payout) {
      payouts.push(payout);
    }
  }

  return { checkout, receipt, ledgerEntry, payouts };
}

export function markCheckoutFailed(checkoutId: string): UniversalCheckoutSession {
  const checkout = sessions.find((session) => session.checkoutId === checkoutId);
  if (!checkout) throw new Error(`Checkout ${checkoutId} not found`);
  checkout.status = "failed";
  return checkout;
}

export function markCheckoutRefunded(checkoutId: string): UniversalCheckoutSession {
  const checkout = sessions.find((session) => session.checkoutId === checkoutId);
  if (!checkout) throw new Error(`Checkout ${checkoutId} not found`);
  checkout.status = "refunded";
  return checkout;
}

export function listUniversalCheckouts(customerId?: string): UniversalCheckoutSession[] {
  if (!customerId) return [...sessions];
  return sessions.filter((session) => session.customerId === customerId);
}

export function getUniversalCheckoutById(checkoutId: string): UniversalCheckoutSession | null {
  return sessions.find((session) => session.checkoutId === checkoutId) ?? null;
}
