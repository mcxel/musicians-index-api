# OWNER_PAYOUT_CLOSURE_PACK.md
## Complete Owner Payout Flow — From Calculation to PayPal
### BerntoutGlobal XXL / The Musician's Index

---

## OWNER PAYOUT DESTINATIONS

```
Marcel Dickens:
  Primary: PayPal → berntmusic33@gmail.com
  Backup: Stripe payout to linked bank (configure in /admin/finance/settings)

J. Paul Sanchez:
  Primary: [PayPal email or Stripe bank — to be configured by Jay Paul in /admin/finance/settings]
  Backup: [backup method — to be configured]
```

**Important:** Payout destinations are stored as encrypted configuration in the platform, not hard-coded. Big Ace configures them at `/admin/finance/owner-settings` before first distribution.

---

## PAYPAL PAYOUT FLOW

```
Platform net profit calculated
         ↓
Big Ace reviews at /admin/finance/profit
         ↓
Big Ace confirms distribution
         ↓
System calculates: ownerAShare = profit × PCT_A
                   ownerBShare = profit × PCT_B
         ↓
PayPal Mass Payout API (or manual Stripe → PayPal transfer)
  → berntmusic33@gmail.com receives Marcel's share
  → Jay Paul's email receives his share
         ↓
OwnerPayout records created (status: 'processing')
         ↓
PayPal webhook confirms delivery
         ↓
OwnerPayout status updated to 'paid'
         ↓
Receipt emailed to each owner
         ↓
Logged in OwnerPayoutAuditLog
```

---

## MANUAL BACKUP PROCESS (If API Fails)

If automated PayPal transfer fails:
1. Big Ace receives alert: "Automated payout failed for [owner]"
2. Big Ace manually initiates transfer from Stripe balance to PayPal
3. Stripe Dashboard → Payouts → Send to external bank/PayPal
4. Enter amount and destination
5. Confirm in platform: /admin/finance/profit → Mark Payout as Manual
6. Record tracked in OwnerPayoutAuditLog with note: 'manual_transfer'

---

## OWNER FINANCE ADMIN ROUTES

```
/admin/finance              → Finance overview dashboard
/admin/finance/profit       → Weekly profit snapshots + distribution calculator
/admin/finance/payouts      → Owner payout history (Marcel + Jay Paul)
/admin/finance/reserves     → Reserve balance and policy
/admin/finance/revenue      → Full revenue breakdown by source
/admin/finance/owner-settings → Payout destination configuration (Big Ace only)
/admin/finance/tax          → Tax export for accountant handoff
```

---

## PRISMA MODELS FOR OWNER FINANCE

```prisma
model OwnerProfitSnapshot {
  id                   String   @id @default(cuid())
  weekStart            DateTime
  weekEnd              DateTime
  grossRevenue         Int      // in cents
  stripeFees           Int
  artistPayouts        Int
  refunds              Int
  chargebacks          Int
  platformNetRevenue   Int
  operatingCosts       Int
  reserveReplenishment Int
  distributableProfit  Int
  ownerAShare          Int      // Marcel
  ownerBShare          Int      // Jay Paul
  reserveShare         Int
  retainedShare        Int
  status               String   @default("calculated") // calculated | approved | distributed | voided
  approvedBy           String?
  approvedAt           DateTime?
  createdAt            DateTime @default(now())

  payouts              OwnerPayout[]
}

model OwnerPayout {
  id               String              @id @default(cuid())
  snapshotId       String
  snapshot         OwnerProfitSnapshot @relation(fields: [snapshotId], references: [id])
  ownerName        String              // 'Marcel Dickens' | 'J. Paul Sanchez'
  ownerEmail       String
  amount           Int                 // in cents
  method           String              // 'paypal' | 'stripe' | 'manual'
  destination      String              // PayPal email or bank descriptor
  status           String              // 'pending' | 'processing' | 'paid' | 'failed'
  externalId       String?             // PayPal payout ID or Stripe transfer ID
  failureReason    String?
  initiatedAt      DateTime            @default(now())
  completedAt      DateTime?
  
  auditLogs        OwnerPayoutAuditLog[]
}

model OwnerPayoutAuditLog {
  id          String      @id @default(cuid())
  payoutId    String
  payout      OwnerPayout @relation(fields: [payoutId], references: [id])
  action      String      // 'calculated' | 'approved' | 'transfer_initiated' | 'paid' | 'failed' | 'manual_transfer'
  performedBy String?     // userId or 'system'
  note        String?
  timestamp   DateTime    @default(now())
}

model PlatformReserve {
  id              String   @id @default(cuid())
  balance         Int      // in cents — current reserve balance
  minimumTarget   Int      // in cents — minimum to maintain
  lastUpdated     DateTime @updatedAt
}

model OperatingCost {
  id          String   @id @default(cuid())
  category    String   // 'hosting' | 'cdn' | 'email' | 'monitoring' | 'api' | 'other'
  vendor      String
  amount      Int      // in cents
  billingDate DateTime
  createdAt   DateTime @default(now())
}
```
