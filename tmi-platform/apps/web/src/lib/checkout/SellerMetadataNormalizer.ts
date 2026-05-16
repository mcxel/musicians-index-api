/**
 * SellerMetadataNormalizer
 * Canonical seller metadata normalization for checkout and payout routing.
 */

export type NormalizedSellerMetadata = {
  sellerId: string;
  sellerType?: "artist" | "venue" | "merchant" | "promoter" | "booking";
};

export function normalizeSellerMetadata(
  metadata: Record<string, string | number | boolean>
): NormalizedSellerMetadata {
  const toNonEmptyString = (value: unknown): string | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const explicitSellerId = toNonEmptyString(metadata.sellerId);
  const explicitSellerType = toNonEmptyString(metadata.sellerType);
  if (explicitSellerId) {
    return {
      sellerId: explicitSellerId,
      sellerType: isKnownSellerType(explicitSellerType) ? explicitSellerType : undefined,
    };
  }

  const aliases: Array<{ key: string; sellerType: NormalizedSellerMetadata["sellerType"] }> = [
    { key: "artistId", sellerType: "artist" },
    { key: "venueId", sellerType: "venue" },
    { key: "merchantId", sellerType: "merchant" },
    { key: "sponsorId", sellerType: "merchant" },
    { key: "promoterId", sellerType: "promoter" },
    { key: "bookingId", sellerType: "booking" },
  ];

  for (const alias of aliases) {
    const value = toNonEmptyString(metadata[alias.key]);
    if (value) {
      return {
        sellerId: value,
        sellerType: alias.sellerType,
      };
    }
  }

  return {
    sellerId: "platform",
  };
}

function isKnownSellerType(value: string | null): value is NonNullable<NormalizedSellerMetadata["sellerType"]> {
  return value === "artist" || value === "venue" || value === "merchant" || value === "promoter" || value === "booking";
}
