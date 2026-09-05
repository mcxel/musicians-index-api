/**
 * Level-1 fee policy certification — fixed ladder, not percentage.
 */
import {
  CANONICAL_TICKET_FEE_POLICY,
  resolveTicketFee,
  buildTicketSaleSplit,
  TICKET_FEE_POLICY_ID,
} from "../TicketFeeResolver";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

export function runTicketFeePolicyCertification(): { ok: true; cases: number } {
  assert(CANONICAL_TICKET_FEE_POLICY.minimumFeeCents === 75, "min fee");
  assert(CANONICAL_TICKET_FEE_POLICY.maximumFeeCents === 999, "max fee");
  assert(TICKET_FEE_POLICY_ID === "tmi-ticket-fee-v1", "policy id");

  const cases: Array<[number, number]> = [
    [99, 75],
    [499, 75],
    [500, 99],
    [999, 99],
    [1000, 149],
    [1999, 149],
    [2000, 199],
    [3999, 199],
    [4000, 299],
    [7499, 299],
    [7500, 499],
    [12499, 499],
    [12500, 699],
    [24999, 699],
    [25000, 999],
    [99999, 999],
  ];

  for (const [price, expectedFee] of cases) {
    const fee = resolveTicketFee({ baseTicketPriceCents: price });
    assert(fee.platformFeeCentsPerTicket === expectedFee, `fee@${price}`);
    assert(fee.hostPayoutCentsPerTicket === price, `payout@${price}`);
    assert(
      fee.buyerTotalCentsPerTicket === price + expectedFee,
      `buyer@${price}`,
    );
  }

  // Explicit anti-% check: $100 face would be $20 at 20% — ladder charges $4.99.
  const hundred = resolveTicketFee({ baseTicketPriceCents: 10000 });
  assert(hundred.platformFeeCentsPerTicket === 499, "not_twenty_percent");
  assert(hundred.platformFeeCentsPerTicket !== 2000, "not_twenty_dollar");

  const split = buildTicketSaleSplit({ baseTicketPriceCents: 299, quantity: 2 });
  assert(split.buyerTotalCents === (299 + 75) * 2, "split buyer");
  assert(split.hostPayoutCents === 299 * 2, "split host");
  assert(split.feePolicyId === TICKET_FEE_POLICY_ID, "split policy");

  return { ok: true, cases: cases.length };
}

if (typeof require !== "undefined" && require.main === module) {
  const r = runTicketFeePolicyCertification();
  console.log("TicketFeePolicy certification PASS", r);
}
