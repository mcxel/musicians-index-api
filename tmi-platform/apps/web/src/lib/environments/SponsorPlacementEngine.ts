/**
 * SponsorPlacementEngine.ts
 * Assigns sponsor/ad slots to rooms and ensures no slot is ever empty.
 * Falls back to house-ad or placeholder states — never blank.
 */

export type SponsorSlotState =
  | "active-sponsor"
  | "house-ad"
  | "sponsor-placeholder"
  | "available-for-purchase"
  | "locked-pending-approval";

export type SponsorSlot = {
  slotId: string;
  label: string;
  /** Normalized 0–1 position within room canvas */
  x: number;
  y: number;
  width: number;
  height: number;
  state: SponsorSlotState;
  sponsorName?: string;
  sponsorColor?: string;
  /** Display text when no sponsor is active */
  fallbackText: string;
};

function makeSlot(
  slotId: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  state: SponsorSlotState,
  sponsorName?: string,
): SponsorSlot {
  return {
    slotId,
    label,
    x,
    y,
    width: w,
    height: h,
    state,
    sponsorName,
    sponsorColor: state === "active-sponsor" ? "#FFD700" : undefined,
    fallbackText: state === "house-ad" ? "TMI NETWORK" : state === "available-for-purchase" ? "YOUR BRAND HERE" : "COMING SOON",
  };
}

/** Default sponsor wall layout for all rooms */
export function buildSponsorSlots(roomId: string): SponsorSlot[] {
  return [
    makeSlot(`${roomId}-sp-left`,         "Left Banner",    0.0,  0.42, 0.11, 0.14, "house-ad"),
    makeSlot(`${roomId}-sp-right`,        "Right Banner",   0.89, 0.42, 0.11, 0.14, "available-for-purchase"),
    makeSlot(`${roomId}-sp-top-l`,        "Top-Left Logo",  0.05, 0.02, 0.1,  0.06, "sponsor-placeholder"),
    makeSlot(`${roomId}-sp-top-r`,        "Top-Right Logo", 0.85, 0.02, 0.1,  0.06, "house-ad"),
    makeSlot(`${roomId}-sp-floor-l`,      "Floor Left",     0.1,  0.87, 0.12, 0.07, "available-for-purchase"),
    makeSlot(`${roomId}-sp-floor-r`,      "Floor Right",    0.78, 0.87, 0.12, 0.07, "house-ad"),
  ];
}

/** Rotate slots on a schedule — called by Sponsor Decor Bot */
export function rotateSponsorSlots(
  slots: SponsorSlot[],
  activeSponsorName: string | null,
): SponsorSlot[] {
  return slots.map((slot) => {
    if (slot.state === "available-for-purchase" && activeSponsorName) {
      return { ...slot, state: "active-sponsor", sponsorName: activeSponsorName, sponsorColor: "#FFD700" };
    }
    return slot;
  });
}

/** Ensure no slot is blank — substitute house-ad if needed */
export function enforceNoEmptySlots(slots: SponsorSlot[]): SponsorSlot[] {
  return slots.map((slot) => {
    if (!slot.state) {
      return { ...slot, state: "house-ad", fallbackText: "TMI NETWORK" };
    }
    return slot;
  });
}
