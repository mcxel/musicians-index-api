/**
 * CheckoutReceiptEngine
 * Receipt persistence for universal checkout transactions.
 */

import type { CheckoutProductType } from "./CheckoutRoutingEngine";

export type CheckoutReceipt = {
  receiptId: string;
  orderId: string;
  checkoutId: string;
  customerId: string;
  productType: CheckoutProductType;
  productId: string;
  quantity: number;
  subtotalCents: number;
  taxCents: number;
  platformFeeCents: number;
  totalCents: number;
  currency: "USD";
  issuedAtMs: number;
};

const receipts: CheckoutReceipt[] = [];
let receiptCounter = 0;

export function buildCheckoutReceipt(input: {
  orderId: string;
  checkoutId: string;
  customerId: string;
  productType: CheckoutProductType;
  productId: string;
  quantity: number;
  subtotalCents: number;
  taxCents: number;
  platformFeeCents: number;
  totalCents: number;
}): CheckoutReceipt {
  const existing = receipts.find((receipt) => {
    if (receipt.checkoutId === input.checkoutId) return true;
    return receipt.orderId === input.orderId;
  });

  if (existing) {
    return existing;
  }

  const receipt: CheckoutReceipt = {
    receiptId: `checkout-receipt-${++receiptCounter}`,
    orderId: input.orderId,
    checkoutId: input.checkoutId,
    customerId: input.customerId,
    productType: input.productType,
    productId: input.productId,
    quantity: input.quantity,
    subtotalCents: input.subtotalCents,
    taxCents: input.taxCents,
    platformFeeCents: input.platformFeeCents,
    totalCents: input.totalCents,
    currency: "USD",
    issuedAtMs: Date.now(),
  };

  receipts.unshift(receipt);
  return receipt;
}

export function getCheckoutReceiptByOrderId(orderId: string): CheckoutReceipt | null {
  return receipts.find((receipt) => receipt.orderId === orderId) ?? null;
}

export function getCheckoutReceiptByCheckoutId(checkoutId: string): CheckoutReceipt | null {
  return receipts.find((receipt) => receipt.checkoutId === checkoutId) ?? null;
}

export function listCheckoutReceipts(customerId?: string): CheckoutReceipt[] {
  if (!customerId) return [...receipts];
  return receipts.filter((receipt) => receipt.customerId === customerId);
}
