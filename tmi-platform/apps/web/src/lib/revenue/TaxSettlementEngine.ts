/**
 * TaxSettlementEngine
 * Tax held, tax owed, reports, and settlement records.
 */

import { listRevenueLedgerEntries } from "./RevenueLedgerEngine";

export type TaxSettlementRecord = {
  settlementId: string;
  jurisdiction: string;
  taxHeldCents: number;
  taxOwedCents: number;
  taxSettledCents: number;
  startDateIso: string;
  endDateIso: string;
  createdAtMs: number;
};

const settlements: TaxSettlementRecord[] = [];
let settlementCounter = 0;

export function summarizeTaxHeld(): { taxHeldCents: number; taxableEntryCount: number } {
  const entries = listRevenueLedgerEntries({ status: "recorded" });
  return {
    taxHeldCents: entries.reduce((sum, entry) => sum + entry.taxCents, 0),
    taxableEntryCount: entries.filter((entry) => entry.taxCents > 0).length,
  };
}

export function buildTaxReport(input: {
  jurisdiction: string;
  startDateIso: string;
  endDateIso: string;
}): {
  jurisdiction: string;
  taxHeldCents: number;
  taxOwedCents: number;
  reportEntryCount: number;
} {
  const entries = listRevenueLedgerEntries({ status: "recorded" });
  const taxHeldCents = entries.reduce((sum, entry) => sum + entry.taxCents, 0);
  return {
    jurisdiction: input.jurisdiction,
    taxHeldCents,
    taxOwedCents: taxHeldCents,
    reportEntryCount: entries.length,
  };
}

export function recordTaxSettlement(input: {
  jurisdiction: string;
  taxSettledCents: number;
  startDateIso: string;
  endDateIso: string;
}): TaxSettlementRecord {
  const report = buildTaxReport({
    jurisdiction: input.jurisdiction,
    startDateIso: input.startDateIso,
    endDateIso: input.endDateIso,
  });

  const settlement: TaxSettlementRecord = {
    settlementId: `tax-settlement-${++settlementCounter}`,
    jurisdiction: input.jurisdiction,
    taxHeldCents: report.taxHeldCents,
    taxOwedCents: report.taxOwedCents,
    taxSettledCents: input.taxSettledCents,
    startDateIso: input.startDateIso,
    endDateIso: input.endDateIso,
    createdAtMs: Date.now(),
  };

  settlements.unshift(settlement);
  return settlement;
}

export function listTaxSettlements(): TaxSettlementRecord[] {
  return [...settlements];
}
