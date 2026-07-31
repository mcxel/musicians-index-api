/**
 * SocialRuntime — Unified Social & Community Base Runtime.
 * Powers Lounges, Fan Lobbies, VIP Rooms, Backstage, and Meet & Greets:
 *  - Room presence & friend arrivals
 *  - Peer WebRTC voice & video state
 *  - Seating & roaming transitions
 *  - Gift drops & crowd reactions
 * Emits semantic events (FriendEnteredLounge, ReactionTriggered, GiftDropped).
 */

import { VenueRuntime } from "./VenueRuntime";

export interface SocialParticipant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isMicOn: boolean;
  isCamOn: boolean;
  currentSeatId?: string;
}

export class SocialRuntime {
  private roomId: string;
  private venue: VenueRuntime;
  private participants: Map<string, SocialParticipant> = new Map();

  constructor(roomId: string, roomName: string) {
    this.roomId = roomId;
    this.venue = new VenueRuntime(roomId, roomName, 100);
  }

  public joinRoom(participant: SocialParticipant) {
    const seat = this.venue.assignSeat(participant.userId);
    if (seat) {
      participant.currentSeatId = seat.id;
    }
    this.participants.set(participant.userId, participant);

    this.emitEvent("FriendEnteredLounge", {
      userId: participant.userId,
      displayName: participant.displayName,
      seatId: seat?.id,
    });
  }

  public leaveRoom(userId: string) {
    const p = this.participants.get(userId);
    if (p?.currentSeatId) {
      this.venue.releaseSeat(p.currentSeatId);
    }
    this.participants.delete(userId);

    this.emitEvent("UserLeftLounge", { userId });
  }

  public sendGift(fromUserId: string, giftName: string) {
    this.emitEvent("GiftDropped", { fromUserId, giftName });
  }

  private emitEvent(eventName: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: { eventName, payload: { ...payload, roomId: this.roomId } },
        })
      );
    } catch (e) {}
  }
}

export default SocialRuntime;
