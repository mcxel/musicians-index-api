/**
 * Bridge: snapshot/hydrate Ticket Trust in-memory authorities ↔ local file store.
 * Does not apply Prisma production migrations.
 */

import {
  enableTicketTrustLocalPersist,
  saveTicketTrustSnapshot,
  loadTicketTrustSnapshot,
  type DurableTicketTrustSnapshot,
} from "./ticketTrustLocalPersistence";
import {
  __exportObligationsForPersist,
  __importObligationsForPersist,
  __resetSettlementObligationsForTests,
} from "./ticketSettlementObligationAuthority";
import {
  __exportCredentialsForPersist,
  __importCredentialsForPersist,
  __resetCredentialsForTests,
} from "./ticketCredentialAuthority";
import {
  __exportFinancialAuditForPersist,
  __importFinancialAuditForPersist,
  __resetFinancialAuditForTests,
} from "./financialAuditLedger";
import {
  __exportTransfersForPersist,
  __importTransfersForPersist,
  __resetTransfersForTests,
} from "./connectPostFulfillmentSettlement";

export function persistTicketTrustLocalSnapshot(dir?: string): DurableTicketTrustSnapshot {
  enableTicketTrustLocalPersist(dir);
  const snap: DurableTicketTrustSnapshot = {
    version: 1,
    obligations: __exportObligationsForPersist(),
    credentials: __exportCredentialsForPersist(),
    audits: __exportFinancialAuditForPersist(),
    transfers: __exportTransfersForPersist(),
    updatedAt: new Date().toISOString(),
  };
  saveTicketTrustSnapshot(snap);
  return snap;
}

export function hydrateTicketTrustFromLocalSnapshot(dir?: string): boolean {
  enableTicketTrustLocalPersist(dir);
  const snap = loadTicketTrustSnapshot();
  if (!snap) return false;
  __resetSettlementObligationsForTests();
  __resetCredentialsForTests();
  __resetFinancialAuditForTests();
  __resetTransfersForTests();
  __importObligationsForPersist(snap.obligations as never);
  __importCredentialsForPersist(snap.credentials as never);
  __importFinancialAuditForPersist(snap.audits as never);
  __importTransfersForPersist(snap.transfers);
  return true;
}

export function clearTicketTrustMemoryForReloadSimulation(): void {
  __resetSettlementObligationsForTests();
  __resetCredentialsForTests();
  __resetFinancialAuditForTests();
  __resetTransfersForTests();
}
