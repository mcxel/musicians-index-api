/**
 * NFTTicketBridgeEngine
 * Links physical/digital ticket records to NFT minting via the NFTMintEngine.
 */
import type { TicketTier } from "./ticketCore";

export type NFTTicketMintStatus =
  | "unminted"
  | "queued"
  | "minting"
  | "minted"
  | "failed"
  | "revoked";

export type NFTTicketRecord = {
  ticketId: string;
  userId: string;
  venueSlug: string;
  eventSlug: string;
  tier: TicketTier;
  nftTokenId: string | null;
  contractAddress: string | null;
  chainId: string;
  mintStatus: NFTTicketMintStatus;
  mintedAtMs: number | null;
  mintTxHash: string | null;
  metadataUri: string | null;
  failReason?: string;
};

export type NFTTicketMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  ticketId: string;
  tier: TicketTier;
  venueSlug: string;
  eventSlug: string;
  holderUserId: string;
};

let _mintSeq = 0;

export class NFTTicketBridgeEngine {
  private readonly records: Map<string, NFTTicketRecord> = new Map();

  registerTicket(params: {
    ticketId: string;
    userId: string;
    venueSlug: string;
    eventSlug: string;
    tier: TicketTier;
    chainId?: string;
  }): NFTTicketRecord {
    const record: NFTTicketRecord = {
      ticketId: params.ticketId,
      userId: params.userId,
      venueSlug: params.venueSlug,
      eventSlug: params.eventSlug,
      tier: params.tier,
      nftTokenId: null,
      contractAddress: null,
      chainId: params.chainId ?? "polygon",
      mintStatus: "unminted",
      mintedAtMs: null,
      mintTxHash: null,
      metadataUri: null,
    };

    this.records.set(params.ticketId, record);
    return record;
  }

  buildMetadata(ticketId: string): NFTTicketMetadata | null {
    const record = this.records.get(ticketId);
    if (!record) return null;

    return {
      name: `TMI Ticket — ${record.tier} — ${record.eventSlug}`,
      description: `Official TMI event ticket for ${record.eventSlug} at ${record.venueSlug}. Tier: ${record.tier}.`,
      image: `https://cdn.tmiplatform.com/nft/tickets/${record.tier.toLowerCase()}.png`,
      attributes: [
        { trait_type: "Tier", value: record.tier },
        { trait_type: "Venue", value: record.venueSlug },
        { trait_type: "Event", value: record.eventSlug },
        { trait_type: "Chain", value: record.chainId },
      ],
      ticketId: record.ticketId,
      tier: record.tier,
      venueSlug: record.venueSlug,
      eventSlug: record.eventSlug,
      holderUserId: record.userId,
    };
  }

  queueForMint(ticketId: string): void {
    const record = this.records.get(ticketId);
    if (!record || record.mintStatus !== "unminted") return;
    record.mintStatus = "queued";
  }

  markMinting(ticketId: string): void {
    const record = this.records.get(ticketId);
    if (!record) return;
    record.mintStatus = "minting";
  }

  markMinted(ticketId: string, tokenId: string, contractAddress: string, txHash: string, metadataUri: string): void {
    const record = this.records.get(ticketId);
    if (!record) return;
    record.mintStatus = "minted";
    record.nftTokenId = tokenId;
    record.contractAddress = contractAddress;
    record.mintTxHash = txHash;
    record.metadataUri = metadataUri;
    record.mintedAtMs = Date.now();
  }

  markFailed(ticketId: string, reason: string): void {
    const record = this.records.get(ticketId);
    if (!record) return;
    record.mintStatus = "failed";
    record.failReason = reason;
  }

  revoke(ticketId: string): void {
    const record = this.records.get(ticketId);
    if (!record) return;
    record.mintStatus = "revoked";
  }

  getRecord(ticketId: string): NFTTicketRecord | null {
    return this.records.get(ticketId) ?? null;
  }

  getMintQueue(): NFTTicketRecord[] {
    return [...this.records.values()].filter((r) => r.mintStatus === "queued");
  }

  getNextMintJob(): NFTTicketRecord | null {
    return this.getMintQueue()[0] ?? null;
  }

  generateTokenId(): string {
    return `tmi-ticket-${Date.now()}-${++_mintSeq}`;
  }
}

export const nftTicketBridgeEngine = new NFTTicketBridgeEngine();
