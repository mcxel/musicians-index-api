import {
  NFTTicketBridgeEngine,
  NFTTicketRecord,
  NFTTicketMetadata,
  nftTicketBridgeEngine,
} from "@/lib/tickets/NFTTicketBridgeEngine";
import type { TicketTier } from "@/lib/tickets/ticketCore";

export type { NFTTicketRecord, NFTTicketMetadata };

export type NFTLifecycleStatus =
  | "unminted"
  | "queued"
  | "minting"
  | "minted"
  | "verified"
  | "transferred"
  | "redeemed"
  | "archived"
  | "revoked"
  | "failed";

export interface NFTTransferRecord {
  ticketId: string;
  fromUserId: string;
  toUserId: string;
  transferredAtMs: number;
  txHash?: string;
}

export interface NFTRedeemRecord {
  ticketId: string;
  userId: string;
  redeemedAtMs: number;
  venueSlug: string;
  gateRef?: string;
}

export interface NFTArchiveRecord {
  ticketId: string;
  archivedAtMs: number;
  reason: "redeemed" | "expired" | "revoked" | "manual";
  originalUserId: string;
}

export interface NFTTicketFullRecord {
  nft: NFTTicketRecord;
  lifecycleStatus: NFTLifecycleStatus;
  transfer?: NFTTransferRecord;
  redeem?: NFTRedeemRecord;
  archive?: NFTArchiveRecord;
}

// ── In-memory lifecycle store ─────────────────────────────────────────────────

const _lifecycle: Map<string, NFTTicketFullRecord> = new Map();
const _bridge: NFTTicketBridgeEngine = nftTicketBridgeEngine;

function getOrCreate(ticketId: string): NFTTicketFullRecord | null {
  const nft = _bridge.getRecord(ticketId);
  if (!nft) return null;

  if (!_lifecycle.has(ticketId)) {
    _lifecycle.set(ticketId, { nft, lifecycleStatus: mapBridgeStatus(nft) });
  }
  return _lifecycle.get(ticketId)!;
}

function mapBridgeStatus(nft: NFTTicketRecord): NFTLifecycleStatus {
  switch (nft.mintStatus) {
    case "unminted": return "unminted";
    case "queued":   return "queued";
    case "minting":  return "minting";
    case "minted":   return "minted";
    case "failed":   return "failed";
    case "revoked":  return "revoked";
    default:         return "unminted";
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function mintTicket(params: {
  ticketId: string;
  userId: string;
  venueSlug: string;
  eventSlug: string;
  tier: TicketTier;
  chainId?: string;
}): NFTTicketFullRecord {
  const existing = _bridge.getRecord(params.ticketId);
  const nft = existing ?? _bridge.registerTicket(params);

  if (nft.mintStatus === "unminted") {
    _bridge.queueForMint(params.ticketId);
  }

  const record: NFTTicketFullRecord = {
    nft: _bridge.getRecord(params.ticketId)!,
    lifecycleStatus: "queued",
  };
  _lifecycle.set(params.ticketId, record);
  return record;
}

export function verifyTicket(ticketId: string): {
  valid: boolean;
  reason?: string;
  record?: NFTTicketFullRecord;
} {
  const record = getOrCreate(ticketId);
  if (!record) return { valid: false, reason: "Ticket not found" };

  const { lifecycleStatus } = record;

  if (lifecycleStatus === "revoked") return { valid: false, reason: "Ticket has been revoked" };
  if (lifecycleStatus === "redeemed") return { valid: false, reason: "Ticket already redeemed" };
  if (lifecycleStatus === "archived") return { valid: false, reason: "Ticket is archived" };
  if (lifecycleStatus === "failed")   return { valid: false, reason: "Mint failed" };
  if (lifecycleStatus === "unminted" || lifecycleStatus === "queued" || lifecycleStatus === "minting") {
    return { valid: false, reason: `Ticket is not yet minted (${lifecycleStatus})` };
  }

  const updated: NFTTicketFullRecord = { ...record, lifecycleStatus: "verified" };
  _lifecycle.set(ticketId, updated);
  return { valid: true, record: updated };
}

export function transferTicket(ticketId: string, fromUserId: string, toUserId: string, txHash?: string): {
  success: boolean;
  record?: NFTTicketFullRecord;
  error?: string;
} {
  const record = getOrCreate(ticketId);
  if (!record) return { success: false, error: "Ticket not found" };
  if (record.nft.userId !== fromUserId) return { success: false, error: "Sender does not own this ticket" };
  if (record.lifecycleStatus === "redeemed") return { success: false, error: "Cannot transfer a redeemed ticket" };
  if (record.lifecycleStatus === "archived" || record.lifecycleStatus === "revoked") {
    return { success: false, error: `Ticket is ${record.lifecycleStatus}` };
  }

  const transfer: NFTTransferRecord = {
    ticketId,
    fromUserId,
    toUserId,
    transferredAtMs: Date.now(),
    txHash,
  };

  // Update ownership on underlying record
  (record.nft as { userId: string }).userId = toUserId;

  const updated: NFTTicketFullRecord = {
    ...record,
    nft: { ...record.nft, userId: toUserId },
    lifecycleStatus: "transferred",
    transfer,
  };
  _lifecycle.set(ticketId, updated);
  return { success: true, record: updated };
}

export function redeemTicket(ticketId: string, userId: string, venueSlug: string, gateRef?: string): {
  success: boolean;
  record?: NFTTicketFullRecord;
  error?: string;
} {
  const record = getOrCreate(ticketId);
  if (!record) return { success: false, error: "Ticket not found" };
  if (record.nft.userId !== userId) return { success: false, error: "User does not own this ticket" };
  if (record.lifecycleStatus === "redeemed") return { success: false, error: "Already redeemed" };
  if (record.lifecycleStatus === "revoked" || record.lifecycleStatus === "archived") {
    return { success: false, error: `Ticket is ${record.lifecycleStatus}` };
  }

  const redeem: NFTRedeemRecord = {
    ticketId,
    userId,
    redeemedAtMs: Date.now(),
    venueSlug,
    gateRef,
  };

  const updated: NFTTicketFullRecord = {
    ...record,
    lifecycleStatus: "redeemed",
    redeem,
  };
  _lifecycle.set(ticketId, updated);
  return { success: true, record: updated };
}

export function archiveTicket(
  ticketId: string,
  reason: NFTArchiveRecord["reason"]
): NFTTicketFullRecord | null {
  const record = getOrCreate(ticketId);
  if (!record) return null;

  const archive: NFTArchiveRecord = {
    ticketId,
    archivedAtMs: Date.now(),
    reason,
    originalUserId: record.nft.userId,
  };

  if (reason === "revoked") {
    _bridge.revoke(ticketId);
  }

  const updated: NFTTicketFullRecord = {
    ...record,
    lifecycleStatus: "archived",
    archive,
  };
  _lifecycle.set(ticketId, updated);
  return updated;
}

export function getTicketRecord(ticketId: string): NFTTicketFullRecord | null {
  return getOrCreate(ticketId);
}

export function getTicketsByUser(userId: string): NFTTicketFullRecord[] {
  return Array.from(_lifecycle.values()).filter((r) => r.nft.userId === userId);
}

export function getTicketsByEvent(eventSlug: string): NFTTicketFullRecord[] {
  return Array.from(_lifecycle.values()).filter((r) => r.nft.eventSlug === eventSlug);
}

export function getMintQueue(): NFTTicketRecord[] {
  return _bridge.getMintQueue();
}

export function buildMetadata(ticketId: string): NFTTicketMetadata | null {
  return _bridge.buildMetadata(ticketId);
}

// Simulate mint completion (call from mint job processor when on-chain tx confirms)
export function confirmMint(
  ticketId: string,
  tokenId: string,
  contractAddress: string,
  txHash: string,
  metadataUri: string
): NFTTicketFullRecord | null {
  _bridge.markMinted(ticketId, tokenId, contractAddress, txHash, metadataUri);
  const record = getOrCreate(ticketId);
  if (!record) return null;

  const updated: NFTTicketFullRecord = {
    ...record,
    nft: _bridge.getRecord(ticketId)!,
    lifecycleStatus: "minted",
  };
  _lifecycle.set(ticketId, updated);
  return updated;
}
