/**
 * MagazinePreviewBus.ts
 *
 * In-House Studio Live Preview Bus.
 * Broadcasts draft magazine page layouts and home hero configurations live to
 * internal Media Player monitors (Monitor A, B, Mobile, Desktop) in real-time.
 *
 * Enables in-house design feedback without needing Git commits or Vercel builds.
 */

import { IssueManifest, MagazineSpreadManifest } from "./MagazineLayoutRuntime";

export type PublicationStatus = "DRAFT" | "PREVIEW" | "REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export interface PreviewChannelMessage {
  channel: "TMI_MAGAZINE_STUDIO";
  targetMonitor: "MONITOR_A" | "MONITOR_B" | "MOBILE_PREVIEW" | "DESKTOP_PREVIEW" | "ALL";
  issueId: string;
  spread: MagazineSpreadManifest;
  status: PublicationStatus;
  timestamp: number;
}

type Listener = (msg: PreviewChannelMessage) => void;

export class MagazinePreviewBus {
  private static instance: MagazinePreviewBus;
  private listeners: Set<Listener> = new Set();

  private constructor() {}

  public static getInstance(): MagazinePreviewBus {
    if (!MagazinePreviewBus.instance) {
      MagazinePreviewBus.instance = new MagazinePreviewBus();
    }
    return MagazinePreviewBus.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public broadcastDraftSpread(
    issueId: string,
    spread: MagazineSpreadManifest,
    targetMonitor: PreviewChannelMessage["targetMonitor"] = "ALL",
    status: PublicationStatus = "PREVIEW",
  ): PreviewChannelMessage {
    const msg: PreviewChannelMessage = {
      channel: "TMI_MAGAZINE_STUDIO",
      targetMonitor,
      issueId,
      spread,
      status,
      timestamp: Date.now(),
    };

    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch {
        // safe error handling
      }
    });

    return msg;
  }

  public promoteToApproved(issue: IssueManifest): IssueManifest {
    return {
      ...issue,
      status: "APPROVED",
    };
  }
}
