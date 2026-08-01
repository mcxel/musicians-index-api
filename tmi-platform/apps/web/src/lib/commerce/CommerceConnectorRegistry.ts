/**
 * CommerceConnectorRegistry — Creator Economy Phase 1.
 *
 * Purpose: register external storefront connectors so artists keep pricing
 * sovereignty while TMI handles discovery → engagement → commerce handoff.
 *
 * Architecture: Commerce Connector (Shopify primary). WooCommerce / BigCommerce /
 * Square / CustomStore are registered stubs with honest "not connected yet"
 * status (Rule 20). Full Admin API product sync is out of scope until Shopify
 * app credentials exist in env.
 *
 * TMI does NOT replace streaming; fulfillment stays on the artist's store.
 * Tickets remain Venue/Promoter-only (Rule 17) — this registry never creates
 * ticket inventory for performers.
 */

import { TMI_COMMERCE_SERVICE_FEE_BPS } from "@/lib/commerce/commerceFees";

export type CommerceConnectorId =
  | "shopify"
  | "woocommerce"
  | "bigcommerce"
  | "square"
  | "custom";

/** Provider-level availability on the platform. */
export type CommerceConnectorStatus = "CONNECTED" | "AVAILABLE" | "COMING_SOON";

export interface CommerceConnectorProvider {
  id: CommerceConnectorId;
  label: string;
  /** Platform capability for this provider. */
  status: CommerceConnectorStatus;
  primary: boolean;
  purpose: string;
  /** Honest capability note shown in connect UI. */
  capabilityNote: string;
}

/**
 * Detect Shopify Admin/app credentials. No keys in repo today — returns false
 * unless env is wired. Client bundles only see NEXT_PUBLIC_* vars.
 */
export function hasShopifyAppCredentials(): boolean {
  if (typeof process === "undefined") return false;
  return Boolean(
    process.env.SHOPIFY_API_KEY ||
      process.env.SHOPIFY_API_SECRET ||
      process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  );
}

function shopifyProviderStatus(): CommerceConnectorStatus {
  return hasShopifyAppCredentials() ? "CONNECTED" : "AVAILABLE";
}

export const COMMERCE_CONNECTOR_PROVIDERS: CommerceConnectorProvider[] = [
  {
    id: "shopify",
    label: "Shopify",
    status: shopifyProviderStatus(),
    primary: true,
    purpose:
      "Primary Commerce Connector — artist-owned Shopify storefront for merch, vinyl, digital drops. Artist is merchant of record.",
    capabilityNote: hasShopifyAppCredentials()
      ? "Shopify app credentials detected — OAuth/product sync can be enabled."
      : "Linked storefront — full product sync requires Shopify app credentials.",
  },
  {
    id: "woocommerce",
    label: "WooCommerce",
    status: "COMING_SOON",
    primary: false,
    purpose: "Registered stub — WordPress/WooCommerce storefront connector.",
    capabilityNote: "Not connected yet.",
  },
  {
    id: "bigcommerce",
    label: "BigCommerce",
    status: "COMING_SOON",
    primary: false,
    purpose: "Registered stub — BigCommerce storefront connector.",
    capabilityNote: "Not connected yet.",
  },
  {
    id: "square",
    label: "Square",
    status: "COMING_SOON",
    primary: false,
    purpose: "Registered stub — Square Online / POS storefront connector.",
    capabilityNote: "Not connected yet.",
  },
  {
    id: "custom",
    label: "Custom Store",
    status: "AVAILABLE",
    primary: false,
    purpose:
      "Manual storefront / affiliate / checkout URL — deep-link Buy when no Shopify app is installed.",
    capabilityNote: "Paste your storefront or checkout URL. No automated product sync.",
  },
];

export function getCommerceConnector(id: CommerceConnectorId): CommerceConnectorProvider | undefined {
  return COMMERCE_CONNECTOR_PROVIDERS.find((p) => p.id === id);
}

export function listCommerceConnectors(): CommerceConnectorProvider[] {
  return [...COMMERCE_CONNECTOR_PROVIDERS];
}

/** Per-performer storefront link (local until Shopify OAuth exists). */
export interface PerformerStorefrontLink {
  performerId: string;
  connectorId: CommerceConnectorId;
  /** e.g. my-band.myshopify.com */
  shopDomain?: string;
  /** Public storefront URL fans land on */
  storefrontUrl: string;
  /** Optional deep-link / affiliate / checkout URL */
  checkoutOrAffiliateUrl?: string;
  linkedAt: string;
  /** Honest link mode — never claims Admin API sync without credentials */
  mode: "linked_storefront" | "shopify_app";
}

const STORAGE_PREFIX = "tmi_commerce_storefront_";

function storageKey(performerId: string): string {
  return `${STORAGE_PREFIX}${performerId}`;
}

/** In-memory seed map — empty by design (Rule 20: no fake storefronts). */
const SEED_LINKS: Record<string, PerformerStorefrontLink> = {};

export function getPerformerStorefrontLink(performerId: string): PerformerStorefrontLink | null {
  if (!performerId) return null;
  const seeded = SEED_LINKS[performerId];
  if (seeded) return seeded;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(performerId));
    if (!raw) return null;
    return JSON.parse(raw) as PerformerStorefrontLink;
  } catch {
    return null;
  }
}

export function savePerformerStorefrontLink(
  link: Omit<PerformerStorefrontLink, "linkedAt" | "mode"> & {
    linkedAt?: string;
    mode?: PerformerStorefrontLink["mode"];
  },
): PerformerStorefrontLink {
  const record: PerformerStorefrontLink = {
    performerId: link.performerId,
    connectorId: link.connectorId,
    shopDomain: link.shopDomain?.trim() || undefined,
    storefrontUrl: link.storefrontUrl.trim(),
    checkoutOrAffiliateUrl: link.checkoutOrAffiliateUrl?.trim() || undefined,
    linkedAt: link.linkedAt ?? new Date().toISOString(),
    mode:
      link.mode ??
      (link.connectorId === "shopify" && hasShopifyAppCredentials()
        ? "shopify_app"
        : "linked_storefront"),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(storageKey(record.performerId), JSON.stringify(record));
    } catch {
      /* quota — ignore */
    }
  }
  return record;
}

export function clearPerformerStorefrontLink(performerId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(performerId));
  } catch {
    /* ignore */
  }
}

/** Prefer affiliate/checkout deep-link, else storefront. */
export function resolveArtistBuyUrl(link: PerformerStorefrontLink | null): string | null {
  if (!link) return null;
  const url = (link.checkoutOrAffiliateUrl || link.storefrontUrl || "").trim();
  return url || null;
}

export function commerceConnectorFeeBps(): number {
  return TMI_COMMERCE_SERVICE_FEE_BPS;
}

export function normalizeShopDomain(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}
