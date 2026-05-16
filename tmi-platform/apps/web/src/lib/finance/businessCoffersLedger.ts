export type LedgerEntryType = "allocation" | "transfer" | "spend" | "blocked";

export type LedgerEntry = {
  id: string;
  businessId: string;
  type: LedgerEntryType;
  amount: number;
  source: string;
  destination: string;
  tag: "BigAceReinvestmentHold";
  note: string;
  actor: string;
  timestamp: number;
};

const ledger: LedgerEntry[] = [];
const cofferBalances: Record<string, number> = {};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function recordLedgerEntry(entry: Omit<LedgerEntry, "id" | "timestamp">) {
  const full: LedgerEntry = {
    ...entry,
    id: uid("ledger"),
    timestamp: Date.now(),
  };

  ledger.unshift(full);
  if (ledger.length > 800) {
    ledger.length = 800;
  }

  if (full.type === "allocation" || full.type === "transfer") {
    cofferBalances[full.businessId] = (cofferBalances[full.businessId] ?? 0) + full.amount;
  }

  if (full.type === "spend") {
    cofferBalances[full.businessId] = Math.max(0, (cofferBalances[full.businessId] ?? 0) - Math.abs(full.amount));
  }

  return full;
}

export function getCoffersBalance(businessId: string) {
  return cofferBalances[businessId] ?? 0;
}

export function getAllCoffersBalances() {
  return { ...cofferBalances };
}

export function getLedgerEntries() {
  return [...ledger];
}
