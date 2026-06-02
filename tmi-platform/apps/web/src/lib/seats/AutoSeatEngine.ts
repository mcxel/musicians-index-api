/**
 * AutoSeatEngine — assigns seats automatically on venue entry
 * Replaces manual seat selection. Called when autoSeat=1 query param is present.
 */

export interface SeatAssignment {
  seatId: string;
  row: number;
  column: number;
  section: "general" | "front" | "vip" | "backstage";
  label: string;
  tier: "standard" | "premium" | "vip";
}

export interface AutoSeatOptions {
  userId?: string;
  venueId: string;
  preferredSection?: "general" | "front" | "vip";
  userTier?: "fan" | "pro" | "vip" | "diamond";
  currentOccupancy?: number;
  totalCapacity?: number;
}

const SECTION_MAP: Record<string, { rowStart: number; rowEnd: number; tier: SeatAssignment["tier"] }> = {
  vip:      { rowStart: 1,  rowEnd: 5,   tier: "vip"      },
  front:    { rowStart: 6,  rowEnd: 15,  tier: "premium"  },
  general:  { rowStart: 16, rowEnd: 50,  tier: "standard" },
};

export function autoAssignSeat(options: AutoSeatOptions): SeatAssignment {
  const { userId, venueId, preferredSection, userTier = "fan", currentOccupancy = 0, totalCapacity = 500 } = options;

  let section: "general" | "front" | "vip" = "general";

  if (preferredSection) {
    section = preferredSection;
  } else if (userTier === "diamond" || userTier === "vip") {
    section = "vip";
  } else if (userTier === "pro") {
    section = "front";
  }

  const occupancyRatio = totalCapacity > 0 ? currentOccupancy / totalCapacity : 0;
  if (occupancyRatio > 0.9 && section === "general") {
    section = "general";
  }

  const sectionConfig = SECTION_MAP[section];
  const seed = userId ? hashCode(userId + venueId) : Math.floor(Math.random() * 1000);
  const row = sectionConfig.rowStart + (Math.abs(seed) % (sectionConfig.rowEnd - sectionConfig.rowStart + 1));
  const column = (Math.abs(seed * 7) % 20) + 1;

  const sectionLabel = section === "vip" ? "VIP" : section === "front" ? "FRONT" : "G";
  const seatId = `${sectionLabel}-R${row}-C${column}`;

  return {
    seatId,
    row,
    column,
    section,
    label: `Row ${row}, Seat ${column}`,
    tier: sectionConfig.tier,
  };
}

export function getSeatDisplayString(seat: SeatAssignment): string {
  return `${seat.section.toUpperCase()} · Row ${seat.row} · Seat ${seat.column}`;
}

export function getSeatColor(seat: SeatAssignment): string {
  switch (seat.tier) {
    case "vip":      return "#AA2DFF";
    case "premium":  return "#FFD700";
    default:         return "#00FFFF";
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
