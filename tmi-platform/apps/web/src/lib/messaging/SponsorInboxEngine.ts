/**
 * SponsorInboxEngine
 * Sponsor ↔ artist deal communication layer.
 *
 * Handles:
 * - Sponsor outreach to artists
 * - Deal proposal messages (structured + free text)
 * - Artist response (accept / counter / decline)
 * - Thread tagged with deal metadata (budget, campaign, deliverables)
 */

import {
  messageThreadEngine,
  type ThreadParticipant,
  type MessageThread,
  type ThreadMessage,
} from "./MessageThreadEngine";

export type DealStatus = "outreach" | "in-negotiation" | "accepted" | "declined" | "expired";

export interface DealProposal {
  proposalId: string;
  sponsorId: string;
  artistId: string;
  campaignName: string;
  budgetUsd: number;
  deliverables: string[];
  deadlineDate: string;
  status: DealStatus;
  threadId: string;
  createdAt: number;
  updatedAt: number;
}

let propSeq = 0;

class SponsorInboxEngine {
  private proposals = new Map<string, DealProposal>();
  /** artistId → proposalIds */
  private artistProposals = new Map<string, string[]>();
  /** sponsorId → proposalIds */
  private sponsorProposals = new Map<string, string[]>();

  /**
   * Sponsor sends a deal proposal to an artist.
   * Creates a message thread tagged with deal metadata.
   */
  sendProposal(params: {
    sponsor: ThreadParticipant;
    artist: ThreadParticipant;
    campaignName: string;
    budgetUsd: number;
    deliverables: string[];
    deadlineDate: string;
    introMessage: string;
  }): DealProposal {
    const thread = messageThreadEngine.getOrCreateThread(
      params.sponsor,
      params.artist,
      "sponsor-artist"
    );

    const proposalId = `deal-${Date.now()}-${++propSeq}`;

    // Send structured proposal message
    const body = [
      `📋 DEAL PROPOSAL: ${params.campaignName}`,
      `💵 Budget: $${params.budgetUsd.toLocaleString()}`,
      `📅 Deadline: ${params.deadlineDate}`,
      `📦 Deliverables: ${params.deliverables.join(", ")}`,
      ``,
      params.introMessage,
    ].join("\n");

    messageThreadEngine.sendMessage({
      threadId: thread.threadId,
      senderId: params.sponsor.userId,
      senderName: params.sponsor.displayName,
      body,
      type: "text",
    });

    const proposal: DealProposal = {
      proposalId,
      sponsorId: params.sponsor.userId,
      artistId: params.artist.userId,
      campaignName: params.campaignName,
      budgetUsd: params.budgetUsd,
      deliverables: params.deliverables,
      deadlineDate: params.deadlineDate,
      status: "outreach",
      threadId: thread.threadId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.proposals.set(proposalId, proposal);
    this.addToIndex(this.artistProposals, params.artist.userId, proposalId);
    this.addToIndex(this.sponsorProposals, params.sponsor.userId, proposalId);

    return proposal;
  }

  private addToIndex(map: Map<string, string[]>, key: string, val: string) {
    const arr = map.get(key) ?? [];
    arr.push(val);
    map.set(key, arr);
  }

  /**
   * Artist replies to a proposal thread.
   */
  artistReply(
    artist: ThreadParticipant,
    proposalId: string,
    body: string
  ): ThreadMessage | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return null;
    if (proposal.status === "declined" || proposal.status === "expired") return null;

    proposal.status = "in-negotiation";
    proposal.updatedAt = Date.now();

    return messageThreadEngine.sendMessage({
      threadId: proposal.threadId,
      senderId: artist.userId,
      senderName: artist.displayName,
      body,
      type: "text",
    });
  }

  acceptProposal(artistId: string, proposalId: string): boolean {
    const p = this.proposals.get(proposalId);
    if (!p || p.artistId !== artistId) return false;
    p.status = "accepted";
    p.updatedAt = Date.now();
    messageThreadEngine.sendMessage({
      threadId: p.threadId,
      senderId: artistId,
      senderName: "Artist",
      body: "✅ Proposal accepted. Let's move forward.",
      type: "system",
    });
    return true;
  }

  declineProposal(artistId: string, proposalId: string): boolean {
    const p = this.proposals.get(proposalId);
    if (!p || p.artistId !== artistId) return false;
    p.status = "declined";
    p.updatedAt = Date.now();
    messageThreadEngine.sendMessage({
      threadId: p.threadId,
      senderId: artistId,
      senderName: "Artist",
      body: "🚫 Proposal declined.",
      type: "system",
    });
    return true;
  }

  getProposal(proposalId: string): DealProposal | undefined {
    return this.proposals.get(proposalId);
  }

  getArtistProposals(artistId: string): DealProposal[] {
    const ids = this.artistProposals.get(artistId) ?? [];
    return ids.map((id) => this.proposals.get(id)!).filter(Boolean);
  }

  getSponsorProposals(sponsorId: string): DealProposal[] {
    const ids = this.sponsorProposals.get(sponsorId) ?? [];
    return ids.map((id) => this.proposals.get(id)!).filter(Boolean);
  }

  getInbox(userId: string): MessageThread[] {
    return messageThreadEngine.getUserThreads(userId);
  }

  getActiveDeals(artistId: string): DealProposal[] {
    return this.getArtistProposals(artistId).filter(
      (p) => p.status === "accepted" || p.status === "in-negotiation"
    );
  }
}

export const sponsorInboxEngine = new SponsorInboxEngine();
