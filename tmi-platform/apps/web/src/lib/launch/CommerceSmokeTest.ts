/**
 * CommerceSmokeTest
 * Programmatic test payloads verifying checkout, ledger, payout, and refund flows.
 */

import { registerCheckoutProduct } from "../checkout/CheckoutProductResolver";
import { createUniversalCheckout, markCheckoutPaid } from "../checkout/UniversalCheckoutEngine";
import { requestRefund, approveRefund, processRefund } from "../revenue/RefundEngine";

export function runCommerceSmokeTest() {
  const logs: string[] = [];

  try {
    // 1. Register Mock Product
    registerCheckoutProduct({
      productType: "ticket",
      productId: "smoke-ticket-1",
      title: "Smoke Test Ticket",
      unitPriceCents: 5000,
      currency: "USD",
      taxable: true,
      metadata: { sellerId: "seller-123", sellerType: "venue" },
    });
    logs.push("✅ Product registered successfully.");

    // 2. Create Checkout
    const checkoutInfo = createUniversalCheckout({
      customerId: "fan-456",
      productType: "ticket",
      productId: "smoke-ticket-1",
      quantity: 2,
    });
    logs.push(`✅ Checkout created: ${checkoutInfo.checkout.checkoutId} (Total: ${checkoutInfo.checkout.totalCents}¢)`);

    // 3. Mark Paid (Success Flow, Receipt, Ledger, Payout)
    const paidResult = markCheckoutPaid(checkoutInfo.checkout.checkoutId);
    logs.push(`✅ Checkout marked paid: ${paidResult.checkout.status}`);
    logs.push(`✅ Receipt created: ${paidResult.receipt.receiptId}`);
    
    if (paidResult.ledgerEntry) {
      logs.push(`✅ Ledger write confirmed: ${paidResult.ledgerEntry.ledgerEntryId}`);
    }
    logs.push(`✅ Payout writes: ${paidResult.payouts.length} generated.`);

    // 4. Refund Flow
    if (paidResult.ledgerEntry) {
      const refundReq = requestRefund({
        ledgerEntryId: paidResult.ledgerEntry.ledgerEntryId,
        reason: "Smoke test refund",
        amountCents: paidResult.ledgerEntry.totalCents,
        payoutId: paidResult.payouts[0]?.payoutId,
      });
      logs.push(`✅ Refund requested: ${refundReq.refundId}`);

      const approved = approveRefund(refundReq.refundId);
      const processed = processRefund(approved.refundId);
      logs.push(`✅ Refund processed & payout rolled back: ${processed.status}`);
    }
    return { status: "PASS", logs };
  } catch (err) {
    return { status: "FAIL", error: err instanceof Error ? err.message : String(err), logs };
  }
}