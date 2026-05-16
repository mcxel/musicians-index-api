/**
 * SeatGridEngine
 * Manages the seat grid layout rendering model for a venue room.
 * Room structure:
 *   Top zone    — performer live video
 *   Middle zone — stage floor
 *   Bottom zone — audience seating (rows × cols)
 *   Side zones  — chat, emojis, gifts, vote panels
 *
 * Seat tiers: front-row (premium), vip-box (premium), main, back
 * Seat upgrades are monetized.
 */

export type SeatTier = "front-row" | "vip-box" | "main" | "back";

export interface SeatUpgradePrice {
  tier: SeatTier;
  pricePoints: number;
  priceUsd: number;
}

export const SEAT_UPGRADE_PRICES: SeatUpgradePrice[] = [
  { tier: "front-row", pricePoints: 50, priceUsd: 4.99 },
  { tier: "vip-box",   pricePoints: 75, priceUsd: 7.99 },
  { tier: "main",      pricePoints: 0,  priceUsd: 0    },
  { tier: "back",      pricePoints: 0,  priceUsd: 0    },
];

export interface GridLayout {
  roomId: string;
  rows: number;
  cols: number;
  zones: {
    performerTop: { height: number };   // % of room height
    stage:        { height: number };
    seating:      { height: number };
    sidebarWidth: number;               // px
  };
  seats: GridSeat[];
}

export interface GridSeat {
  seatId: string;
  row: number;
  col: number;
  tier: SeatTier;
  isPremium: boolean;
  x: number;   // relative % position
  y: number;
}

class SeatGridEngine {
  private layouts = new Map<string, GridLayout>();

  /**
   * Generate a seat grid layout for a room.
   * Returns a full layout object for rendering.
   */
  generateLayout(roomId: string, rows = 6, cols = 10): GridLayout {
    const seats: GridSeat[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tier: SeatTier =
          r === 0             ? "front-row"
          : c === 0 || c === cols - 1 ? "vip-box"
          : r >= rows - 1     ? "back"
          : "main";

        seats.push({
          seatId: `r${r}c${c}`,
          row: r,
          col: c,
          tier,
          isPremium: tier === "front-row" || tier === "vip-box",
          x: (c / (cols - 1)) * 100,
          y: (r / (rows - 1)) * 100,
        });
      }
    }

    const layout: GridLayout = {
      roomId,
      rows,
      cols,
      zones: {
        performerTop: { height: 35 },
        stage:        { height: 25 },
        seating:      { height: 40 },
        sidebarWidth: 240,
      },
      seats,
    };

    this.layouts.set(roomId, layout);
    return layout;
  }

  getLayout(roomId: string): GridLayout | undefined {
    return this.layouts.get(roomId);
  }

  getSeatTier(seatId: string): SeatTier {
    if (seatId.startsWith("r0")) return "front-row";
    if (seatId.endsWith("c0") || seatId.match(/c\d+$/)?.at(0) === "c9") return "vip-box";
    return "main";
  }

  getUpgradePrice(tier: SeatTier): SeatUpgradePrice {
    return SEAT_UPGRADE_PRICES.find((p) => p.tier === tier) ?? SEAT_UPGRADE_PRICES[2]!;
  }
}

export const seatGridEngine = new SeatGridEngine();
