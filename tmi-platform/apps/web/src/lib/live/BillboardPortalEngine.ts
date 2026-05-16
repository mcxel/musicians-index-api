/**
 * BillboardPortalEngine
 * Every public live room billboard acts as a clickable portal.
 * Billboard shows: live preview, host, room name, occupancy, genre, tips, battle status, join button.
 * Click = join room instantly.
 */

import type { RoomType } from "./VenuePresenceEngine";

export interface BillboardPortal {
  portalId: string;
  roomId: string;
  roomType: RoomType;
  title: string;
  genre: string;
  hostName: string;
  hostImageUrl: string;
  livePreviewUrl?: string;   // live snapshot or stream thumbnail
  occupancy: number;
  capacity: number;
  energyScore: number;       // 0–100
  energyLabel: string;
  tipsTotal: number;
  battleStatus?: string;     // e.g. "LIVE BATTLE", "VOTING OPEN", "QUEUE OPEN"
  joinRoute: string;         // client-side route to join
  isPublic: boolean;
  isJoinable: boolean;
  tags: string[];
  createdAt: number;
  lastActivityAt: number;
}

class BillboardPortalEngine {
  private portals = new Map<string, BillboardPortal>();

  register(portal: BillboardPortal): void {
    this.portals.set(portal.portalId, portal);
  }

  upsert(params: {
    roomId: string;
    roomType: RoomType;
    title: string;
    genre: string;
    hostName: string;
    hostImageUrl: string;
    livePreviewUrl?: string;
    occupancy: number;
    capacity: number;
    energyScore: number;
    energyLabel: string;
    tipsTotal: number;
    battleStatus?: string;
    isPublic: boolean;
    isJoinable: boolean;
    tags?: string[];
  }): BillboardPortal {
    const existing = this.portals.get(params.roomId);
    const portal: BillboardPortal = {
      portalId: params.roomId,
      joinRoute: `/rooms/${params.roomType}/${params.roomId}`,
      createdAt: existing?.createdAt ?? Date.now(),
      lastActivityAt: Date.now(),
      tags: params.tags ?? [],
      ...params,
    };
    this.portals.set(params.roomId, portal);
    return portal;
  }

  /**
   * Get all public joinable billboards, sorted by energy descending.
   */
  getPublicPortals(limit?: number): BillboardPortal[] {
    const results = [...this.portals.values()]
      .filter((p) => p.isPublic && p.isJoinable)
      .sort((a, b) => b.energyScore - a.energyScore);
    return limit ? results.slice(0, limit) : results;
  }

  /**
   * Filter by room type.
   */
  getByType(roomType: RoomType, limit?: number): BillboardPortal[] {
    const results = [...this.portals.values()]
      .filter((p) => p.roomType === roomType && p.isPublic)
      .sort((a, b) => b.occupancy - a.occupancy);
    return limit ? results.slice(0, limit) : results;
  }

  /**
   * Filter by genre tag.
   */
  getByGenre(genre: string, limit?: number): BillboardPortal[] {
    const g = genre.toLowerCase();
    const results = [...this.portals.values()]
      .filter((p) => p.genre.toLowerCase() === g && p.isPublic)
      .sort((a, b) => b.energyScore - a.energyScore);
    return limit ? results.slice(0, limit) : results;
  }

  getPortal(roomId: string): BillboardPortal | undefined {
    return this.portals.get(roomId);
  }

  updateEnergy(roomId: string, energyScore: number, energyLabel: string): void {
    const p = this.portals.get(roomId);
    if (p) {
      p.energyScore = energyScore;
      p.energyLabel = energyLabel;
      p.lastActivityAt = Date.now();
    }
  }

  updateOccupancy(roomId: string, occupancy: number): void {
    const p = this.portals.get(roomId);
    if (p) {
      p.occupancy = occupancy;
      p.lastActivityAt = Date.now();
    }
  }

  updateBattleStatus(roomId: string, status: string): void {
    const p = this.portals.get(roomId);
    if (p) p.battleStatus = status;
  }

  closePortal(roomId: string): void {
    const p = this.portals.get(roomId);
    if (p) p.isJoinable = false;
  }

  removePortal(roomId: string): void {
    this.portals.delete(roomId);
  }
}

export const billboardPortalEngine = new BillboardPortalEngine();
