/**
 * Source-scan certification — P0 ad_purchase fulfillment durability wiring.
 * Local fixtures / file evidence only. No production DB. No Stripe mutations.
 */

import fs from "fs";
import path from "path";

const root = path.join(__dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

export function runAdPurchaseFulfillmentDurabilityTest() {
  const results: Record<string, boolean> = {};

  const authority = read("lib/commerce/AdPurchaseFulfillmentAuthority.ts");
  const webhook = read("app/api/stripe/webhook/route.ts");
  const engine = read("lib/commerce/EntitlementFulfillmentEngine.ts");
  const adminApi = read("app/api/admin/commerce/pending-ad-purchases/route.ts");
  const adminPage = read("app/admin/fulfillment/page.tsx");
  const paymentSuccess = read("app/payment-success/page.tsx");
  const schema = fs.readFileSync(
    path.join(root, "../../../packages/db/prisma/schema.prisma"),
    "utf8",
  );
  const migrationColumns = fs.readFileSync(
    path.join(
      root,
      "../../../packages/db/prisma/migrations/20261112160000_order_ad_purchase_durability/migration.sql",
    ),
    "utf8",
  );
  const migrationIndexes = fs.readFileSync(
    path.join(
      root,
      "../../../packages/db/prisma/migrations/20261112170000_order_ad_purchase_durability_indexes/migration.sql",
    ),
    "utf8",
  );

  results["authority_exists"] = /buildAdPurchaseOrderPersistFields/.test(authority);
  results["authority_never_auto_activates"] =
    /autoActivated:\s*false/.test(authority) &&
    /PENDING_CREATIVE_REVIEW/.test(authority) &&
    /NEVER auto-activates/.test(authority) &&
    !/adActivationStatus:\s*["']LIVE["']/.test(authority);
  results["schema_nullable_order_fields"] =
    /orderKind String\?/.test(schema) &&
    /refId\s+String\?/.test(schema) &&
    /fulfillmentMetadataJson String\?/.test(schema) &&
    /adActivationStatus String\?/.test(schema);
  results["migration_nullable_add_column"] =
    /ADD COLUMN IF NOT EXISTS "orderKind"/.test(migrationColumns) &&
    /ADD COLUMN IF NOT EXISTS "adActivationStatus"/.test(migrationColumns) &&
    // Comments may mention CREATE INDEX; executable DDL must not create indexes here.
    !/^\s*CREATE INDEX/m.test(migrationColumns);
  results["migration_indexes_use_concurrently"] =
    /CREATE INDEX CONCURRENTLY IF NOT EXISTS "Order_orderKind_status_idx"/.test(
      migrationIndexes,
    ) &&
    /CREATE INDEX CONCURRENTLY IF NOT EXISTS "Order_adActivationStatus_idx"/.test(
      migrationIndexes,
    );
  results["webhook_persists_ad_purchase_fields"] =
    /buildAdPurchaseOrderPersistFields/.test(webhook) &&
    /orderKind:\s*durable\.orderKind/.test(webhook) &&
    /adActivationStatus:\s*durable\.adActivationStatus/.test(webhook);
  results["webhook_idempotent_update_then_create"] =
    /updateMany/.test(webhook) &&
    /updated\.count === 0/.test(webhook) &&
    /ad_purchase/.test(webhook);
  results["webhook_no_auto_live"] =
    /not auto-activated/.test(webhook) &&
    !/adActivationStatus:\s*['"]LIVE['"]/.test(webhook);
  results["fulfillment_engine_ad_branch"] =
    /ensureAdPurchasePendingActivation/.test(engine) &&
    /STILL_PENDING/.test(engine) &&
    /order\.orderKind === ['"]ad_purchase['"]/.test(engine);
  results["admin_api_reads_real_orders"] =
    /AD_PURCHASE_ORDER_KIND/.test(adminApi) &&
    /prisma\.order\.findMany/.test(adminApi) &&
    /requireAdmin/.test(adminApi);
  results["admin_page_loads_real_ad_api"] =
    /\/api\/admin\/commerce\/pending-ad-purchases/.test(adminPage) &&
    /PENDING CREATIVE REVIEW|pending creative review/i.test(adminPage);
  results["admin_page_labels_pod_as_illustrative"] =
    /ILLUSTRATIVE LOCAL SEED/.test(adminPage);
  results["payment_success_honest_pending_copy"] =
    /AWAITING CREATIVE REVIEW/.test(paymentSuccess) &&
    /not auto-activated/i.test(paymentSuccess);

  const allPassed = Object.values(results).every(Boolean);
  console.log(
    "[AD_PURCHASE_FULFILLMENT_DURABILITY_TEST_ASSERT]",
    JSON.stringify({ allPassed, results }, null, 2),
  );
  return { allPassed, results };
}

describe("Ad purchase fulfillment durability (source-scan)", () => {
  it("wires durable Order trail without auto-activation", () => {
    const { allPassed, results } = runAdPurchaseFulfillmentDurabilityTest();
    expect(results).toEqual(
      expect.objectContaining({
        authority_exists: true,
        webhook_persists_ad_purchase_fields: true,
        admin_api_reads_real_orders: true,
      }),
    );
    expect(allPassed).toBe(true);
  });
});
