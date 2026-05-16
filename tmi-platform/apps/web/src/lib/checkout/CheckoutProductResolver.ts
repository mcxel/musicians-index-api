/**
 * CheckoutProductResolver
 * Product lookup, validation, resolution, and metadata binding for universal checkout.
 */

import type { CheckoutProductType } from "./CheckoutRoutingEngine";
import { normalizeSellerMetadata } from "./SellerMetadataNormalizer";

export type CheckoutProductRecord = {
  productType: CheckoutProductType;
  productId: string;
  title: string;
  unitPriceCents: number;
  currency: "USD";
  taxable: boolean;
  platformFeeCents?: number;
  metadata?: Record<string, string | number | boolean>;
};

export type CheckoutProductProvider = (
  productId: string
) => CheckoutProductRecord | null;

const providers = new Map<CheckoutProductType, CheckoutProductProvider>();
const productCatalog = new Map<string, CheckoutProductRecord>();

function key(type: CheckoutProductType, id: string): string {
  return `${type}:${id}`;
}

export function registerCheckoutProductProvider(
  productType: CheckoutProductType,
  provider: CheckoutProductProvider
): void {
  providers.set(productType, provider);
}

export function registerCheckoutProduct(record: CheckoutProductRecord): void {
  productCatalog.set(key(record.productType, record.productId), record);
}

export function resolveCheckoutProduct(input: {
  productType: CheckoutProductType;
  productId: string;
}): CheckoutProductRecord {
  const direct = productCatalog.get(key(input.productType, input.productId));
  if (direct) return direct;

  const provider = providers.get(input.productType);
  if (provider) {
    const provided = provider(input.productId);
    if (provided) return provided;
  }

  throw new Error(`Checkout product not found for ${input.productType}:${input.productId}`);
}

export function validateCheckoutProduct(record: CheckoutProductRecord): void {
  if (!record.productId) throw new Error("Checkout product must have productId");
  if (!record.title) throw new Error("Checkout product must have title");
  if (record.unitPriceCents < 0) throw new Error("Checkout product price cannot be negative");
  if (record.currency !== "USD") throw new Error("Only USD is currently supported");
}

export function resolveProductMetadata(input: {
  productType: CheckoutProductType;
  productId: string;
  customerId?: string;
}): Record<string, string | number | boolean> {
  const record = resolveCheckoutProduct({
    productType: input.productType,
    productId: input.productId,
  });

  const normalizedSeller = normalizeSellerMetadata(record.metadata ?? {});

  return {
    ...record.metadata,
    productType: record.productType,
    productId: record.productId,
    customerId: input.customerId ?? "",
    title: record.title,
    sellerId: normalizedSeller.sellerId,
    ...(normalizedSeller.sellerType ? { sellerType: normalizedSeller.sellerType } : {}),
  };
}

export function listRegisteredCheckoutProducts(productType?: CheckoutProductType): CheckoutProductRecord[] {
  const values = [...productCatalog.values()];
  if (!productType) return values;
  return values.filter((record) => record.productType === productType);
}
