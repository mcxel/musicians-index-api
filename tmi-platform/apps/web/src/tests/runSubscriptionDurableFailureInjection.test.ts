import type { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    stripeWebhookEvent: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    user: { findFirst: jest.fn(), updateMany: jest.fn() },
    order: { findFirst: jest.fn(async () => null) },
    $transaction: jest.fn(),
  },
}));
jest.mock("@/lib/stripe/client", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) },
    subscriptions: { retrieve: jest.fn(async () => ({
      id: "sub_test", items: { data: [{ price: { id: "price_test" } }] },
    })) },
    customers: { retrieve: jest.fn(async () => ({ email: "fan@example.test" })) },
    invoices: { list: (...args: unknown[]) => mockInvoiceList(...args), retrieve: (...args: unknown[]) => mockInvoiceRetrieve(...args) },
    checkout: { sessions: { retrieve: (...args: unknown[]) => mockRetrieveSession(...args), list: jest.fn(async () => ({ data: [] })) } },
  }),
}));
jest.mock("@/lib/stripe/tierMapping", () => ({ tierForPriceId: (id: string) => id === "price_test" ? "PRO" : null }));
jest.mock("@/lib/auth/UserStore", () => ({ syncPersistedUserTier: jest.fn() }));
jest.mock("@/lib/auth/getTmiAuth", () => ({
  getTmiAuth: jest.fn(async () => ({ user: { email: "fan@example.test" } })),
}));
jest.mock("@/lib/security/previewFinancialIsolation", () => ({ assertPreviewFinancialIsolation: jest.fn() }));
jest.mock("@/lib/email/TMIEmailSystem", () => ({ sendEmail: jest.fn() }));
jest.mock("@vercel/functions", () => ({ waitUntil: jest.fn() }));
jest.mock("@/lib/tips/tipFulfillment", () => ({}));
jest.mock("@/lib/stripe/stripe-telemetry-store", () => ({ recordStripeEvent: jest.fn() }));
jest.mock("@/lib/commerce/economicPaymentLedger", () => ({}));
jest.mock("@/lib/venue/VenueSkinCommerce", () => ({}));
jest.mock("@/lib/commerce/CommerceCatalogContract", () => ({}));
jest.mock("@/lib/booking/performerPayoutWebhookBridge", () => ({}));
jest.mock("@/lib/commerce/YoPhoCheckoutFulfillment", () => ({}));
jest.mock("@/lib/commerce/CheckoutSettlementAuthority", () => ({ recordPaymentReversal: jest.fn() }));
jest.mock("@/lib/discovery/DiscoveryBoostEngine", () => ({ revokeDiscoveryBoostByPaymentRef: jest.fn() }));
jest.mock("@/lib/lobby/LobbyWallBoostEngine", () => ({ revokeLobbyWallBoostByPaymentRef: jest.fn() }));
jest.mock("@/lib/yopho/YoPhoSkinRegistry", () => ({ revokeDurableYoPhoEntitlementByPaymentRef: jest.fn() }));
jest.mock("@/lib/commerce/RefundEntitlementRevocation", () => ({ revokeRefundedEntitlements: jest.fn(async () => ({ status: "REVOKED", storeItems: 0, venueSkins: 0 })) }));
jest.mock("@/lib/live/backstage/challengerQueueDb", () => ({ prismaQueueDb: { read: {} } }));
jest.mock("@/lib/stripe/products", () => ({ STRIPE_PRODUCTS: {} }));
jest.mock("@/lib/sponsors/CreatorSponsorshipCreditAuthority", () => ({
  isCreatorSponsorshipMetadataType: () => false,
}));

import { prisma } from "@/lib/prisma";
import { syncPersistedUserTier } from "@/lib/auth/UserStore";
import { sendEmail } from "@/lib/email/TMIEmailSystem";

const mockConstructEvent = jest.fn();
const mockRetrieveSession = jest.fn();
const mockInvoiceList = jest.fn();
const mockInvoiceRetrieve = jest.fn();
const db = prisma as jest.Mocked<typeof prisma>;
const receiptCreate = db.stripeWebhookEvent.create as jest.Mock;
const receiptFind = db.stripeWebhookEvent.findUnique as jest.Mock;
const receiptUpdate = db.stripeWebhookEvent.update as jest.Mock;
const receiptUpdateMany = db.stripeWebhookEvent.updateMany as jest.Mock;
const transaction = db.$transaction as jest.Mock;
const request = {
  text: async () => "{}",
  headers: new Headers({ "stripe-signature": "test-signature" }),
} as NextRequest;

let post: (req: NextRequest) => Promise<Response>;
let activate: (req: NextRequest) => Promise<Response>;
let receipt: string | null;
let tier: string;
let failUserWrite: boolean;
let failReceiptWrite: boolean;
let grants: number;
let eventId = 0;

beforeAll(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "test-only-secret";
  post = require("@/app/api/stripe/webhook/route").POST;
  activate = require("@/app/api/subscriptions/activate/route").POST;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockInvoiceList.mockResolvedValue({ data: [] });
  receipt = null;
  tier = "FREE";
  failUserWrite = false;
  failReceiptWrite = false;
  grants = 0;
  eventId += 1;
  mockRetrieveSession.mockResolvedValue({
    payment_status: "paid", status: "complete", mode: "subscription",
    customer_email: "fan@example.test", customer: "cus_test",
    subscription: { id: "sub_test", status: "active", items: { data: [{ price: { id: "price_test" } }] } },
  });
  mockConstructEvent.mockReturnValue({
    id: `evt_p0_${eventId}`, type: "checkout.session.completed",
    data: { object: {
      id: "cs_test", mode: "subscription", subscription: "sub_test", customer: "cus_test",
      customer_email: "fan@example.test", metadata: {}, payment_status: "paid",
    } },
  });
  receiptCreate.mockImplementation(async () => {
    if (receipt) throw { code: "P2002" };
    receipt = "RECEIVED";
  });
  receiptFind.mockImplementation(async () => receipt ? { status: receipt } : null);
  receiptUpdate.mockImplementation(async ({ data }) => { receipt = data.status; });
  receiptUpdateMany.mockImplementation(async ({ data }) => {
    if (!receipt || receipt === "PROCESSED") return { count: 0 };
    receipt = data.status;
    return { count: 1 };
  });
  transaction.mockImplementation(async (run: (tx: object) => Promise<boolean>) => {
    let stagedReceipt = receipt;
    let stagedTier = tier;
    let stagedGrants = 0;
    const tx = {
      stripeWebhookEvent: {
        updateMany: async ({ data }: { data: { status: string } }) => {
          if (!stagedReceipt || stagedReceipt === "PROCESSED") return { count: 0 };
          stagedReceipt = data.status;
          return { count: 1 };
        },
        findUnique: async () => stagedReceipt ? { status: stagedReceipt } : null,
        update: async ({ data }: { data: { status: string } }) => {
          if (failReceiptWrite) throw new Error("receipt write failed");
          stagedReceipt = data.status;
        },
      },
      user: {
        findFirst: async () => ({ billingStatus: "active", billingGraceEndsAt: null, stripeSubscriptionId: "sub_test" }),
        updateMany: async ({ data }: { data: { tier?: string } }) => {
          if (failUserWrite) throw new Error("database write failed");
          if (data.tier) { stagedTier = data.tier; stagedGrants += 1; }
          return { count: 1 };
        },
      },
    };
    const result = await run(tx);
    receipt = stagedReceipt;
    tier = stagedTier;
    grants += stagedGrants;
    return result;
  });
});

it("STRIPE-01/02: a failed entitlement write returns 500 and leaves the receipt retryable", async () => {
  failUserWrite = true;
  const response = await post(request);
  expect(response.status).toBe(500);
  expect(receipt).toBe("FAILED_RETRYABLE");
  expect(tier).toBe("FREE");
  expect(syncPersistedUserTier).not.toHaveBeenCalled();
});

it("STRIPE-03/04: retry commits once and a committed duplicate is skipped", async () => {
  failUserWrite = true;
  expect((await post(request)).status).toBe(500);
  failUserWrite = false;
  expect((await post(request)).status).toBe(200);
  expect(receipt).toBe("PROCESSED");
  expect(tier).toBe("PRO");
  expect((await post(request)).status).toBe(200);
  expect(grants).toBe(1);
});

it("a failed processed-receipt write rolls back the entitlement", async () => {
  failReceiptWrite = true;
  expect((await post(request)).status).toBe(500);
  expect(receipt).toBe("FAILED_RETRYABLE");
  expect(tier).toBe("FREE");
  expect(grants).toBe(0);
  expect(syncPersistedUserTier).not.toHaveBeenCalled();
});

it("an unpaid subscription checkout cannot grant paid access", async () => {
  mockConstructEvent.mockReturnValue({
    id: `evt_unpaid_${eventId}`, type: "checkout.session.completed",
    data: { object: {
      id: "cs_test", mode: "subscription", subscription: "sub_test", customer: "cus_test",
      customer_email: "fan@example.test", metadata: {}, payment_status: "unpaid",
    } },
  });
  mockRetrieveSession.mockResolvedValueOnce({ payment_status: "unpaid" });
  expect((await post(request)).status).toBe(500);
  expect(receipt).toBe("FAILED_RETRYABLE");
  expect(tier).toBe("FREE");
});

it("STRIPE-05: billing grace failure cannot be acknowledged", async () => {
  mockConstructEvent.mockReturnValue({
    id: `evt_grace_${eventId}`, type: "customer.subscription.updated",
    data: { object: { id: "sub_test", customer: "cus_test", status: "past_due", items: { data: [{ price: { id: "price_test" } }] } } },
  });
  failUserWrite = true;
  expect((await post(request)).status).toBe(500);
  expect(receipt).toBe("FAILED_RETRYABLE");
});

it("STRIPE-06: cancellation failure cannot be acknowledged", async () => {
  mockConstructEvent.mockReturnValue({
    id: `evt_cancel_${eventId}`, type: "customer.subscription.deleted",
    data: { object: { id: "sub_test", customer: "cus_test", items: { data: [{ price: { id: "price_test" } }] } } },
  });
  failUserWrite = true;
  expect((await post(request)).status).toBe(500);
  expect(receipt).toBe("FAILED_RETRYABLE");
});

it("STRIPE-06: refund revocation failure on a subscription-linked invoice cannot be acknowledged", async () => {
  mockConstructEvent.mockReturnValue({
    id: `evt_refund_${eventId}`, type: "charge.refunded",
    data: { object: {
      id: "ch_test",
      billing_details: { email: "fan@example.test" },
      invoice: { id: "in_sub_test", subscription: "sub_test" },
      refunded: true,
      refunds: { data: [] },
    } },
  });
  (db.user.findFirst as jest.Mock).mockResolvedValueOnce({ stripeSubscriptionId: "sub_test" });
  failUserWrite = true;
  expect((await post(request)).status).toBe(500);
  expect(receipt).toBe("FAILED_RETRYABLE");
});

it("STRIPE-07: unrelated non-subscription refund does NOT revoke active subscription entitlement", async () => {
  tier = "PRO";
  mockConstructEvent.mockReturnValue({
    id: `evt_refund_unrelated_${eventId}`, type: "charge.refunded",
    data: { object: {
      id: "ch_tip_only",
      billing_details: { email: "fan@example.test" },
      invoice: null,
      refunded: true,
      refunds: { data: [] },
    } },
  });
  (db.user.findFirst as jest.Mock).mockResolvedValueOnce({ stripeSubscriptionId: "sub_test" });
  const response = await post(request);
  expect(response.status).toBe(200);
  expect(tier).toBe("PRO");
  expect(syncPersistedUserTier).not.toHaveBeenCalledWith("fan@example.test", "FREE");
});

it("STRIPE-08: stale subscription.deleted for a non-matching subscriptionId does NOT downgrade warm cache", async () => {
  tier = "PRO";
  mockConstructEvent.mockReturnValue({
    id: `evt_cancel_stale_${eventId}`, type: "customer.subscription.deleted",
    data: { object: {
      id: "sub_stale_old",
      customer: "cus_test",
      items: { data: [{ price: { id: "price_test" } }] },
    } },
  });
  const response = await post(request);
  expect(response.status).toBe(200);
  expect(tier).toBe("PRO");
  expect(syncPersistedUserTier).not.toHaveBeenCalledWith("fan@example.test", "FREE");
  expect(sendEmail).not.toHaveBeenCalled();
});

it("STRIPE-09: resolves a fully refunded payment from current invoice payments (payments.data[].payment.payment_intent)", async () => {
  tier = "PRO";
  mockConstructEvent.mockReturnValue({
    id: `evt_current_invoice_${eventId}`, type: "charge.refunded",
    data: { object: {
      id: "ch_current", billing_details: { email: "fan@example.test" },
      payment_intent: "pi_current", invoice: null, refunded: true, refunds: { data: [] },
    } },
  });
  (db.user.findFirst as jest.Mock).mockResolvedValueOnce({ stripeSubscriptionId: "sub_test" });
  mockInvoiceList.mockResolvedValueOnce({ data: [{
    id: "in_current", parent: { subscription_details: { subscription: "sub_test" } },
    payments: { data: [{ payment: { type: "payment_intent", payment_intent: "pi_current" } }] },
  }] });
  expect((await post(request)).status).toBe(200);
  expect(tier).toBe("FREE");
});

it("STRIPE-10: direct invoice retrieval failure and payment-to-invoice lookup failure are both retryable (500 FAILED_RETRYABLE)", async () => {
  tier = "PRO";
  mockConstructEvent.mockReturnValue({
    id: `evt_invoice_failure_${eventId}`, type: "charge.refunded",
    data: { object: { id: "ch_invoice_failure", billing_details: { email: "fan@example.test" }, invoice: "in_test", refunded: true, refunds: { data: [] } } },
  });
  (db.user.findFirst as jest.Mock).mockResolvedValueOnce({ stripeSubscriptionId: "sub_test" });
  mockInvoiceRetrieve.mockRejectedValueOnce(new Error("transient invoice retrieval failure"));
  expect((await post(request)).status).toBe(500);
  expect(receipt).toBe("FAILED_RETRYABLE");

  receipt = null;
  mockConstructEvent.mockReturnValue({
    id: `evt_lookup_failure_${eventId}`, type: "charge.refunded",
    data: { object: {
      id: "ch_lookup", billing_details: { email: "fan@example.test" },
      payment_intent: "pi_current", invoice: null, refunded: true, refunds: { data: [] },
    } },
  });
  (db.user.findFirst as jest.Mock).mockResolvedValueOnce({ stripeSubscriptionId: "sub_test" });
  mockInvoiceList.mockRejectedValueOnce(new Error("transient lookup failure"));
  expect((await post(request)).status).toBe(500);
  expect(receipt).toBe("FAILED_RETRYABLE");
});

it("activation cannot report success when the entitlement read fails or is pending", async () => {
  const activationRequest = { json: async () => ({ sessionId: "cs_test" }) } as NextRequest;
  (db.user.findFirst as jest.Mock).mockRejectedValueOnce(new Error("database unavailable"));
  expect((await activate(activationRequest)).status).toBe(500);
  (db.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
  expect((await activate(activationRequest)).status).toBe(409);
});

it("activation refuses a complete but unpaid checkout", async () => {
  mockRetrieveSession.mockResolvedValueOnce({ payment_status: "unpaid", status: "complete" });
  const response = await activate({ json: async () => ({ sessionId: "cs_test" }) } as NextRequest);
  expect(response.status).toBe(402);
});

it("activation confirms an already committed matching entitlement", async () => {
  (db.user.findFirst as jest.Mock).mockResolvedValueOnce({
    tier: "PRO", stripeSubscriptionId: "sub_test", stripePriceId: "price_test",
  });
  const response = await activate({ json: async () => ({ sessionId: "cs_test" }) } as NextRequest);
  expect(response.status).toBe(200);
  expect((await response.json()).tier).toBe("PRO");
});
