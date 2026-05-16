"use client";

import type { FanSeat } from "./FanSeatEngine";

type FanCrowdPresenceProps = {
  seat: FanSeat;
  invitedFriends: string[];
};

export default function FanCrowdPresence({ seat, invitedFriends }: FanCrowdPresenceProps) {
  return (
    <div style={{ borderRadius: 12, border: "1px solid rgba(90,215,255,0.34)", background: "rgba(5,14,31,0.86)", padding: 10 }}>
      <div style={{ color: "#8fd6ff", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Crowd Presence</div>
      <div style={{ color: "#d8efff", fontSize: 12, marginBottom: 8 }}>
        Seat: {seat.seatId} | Row {seat.row} | Zone {seat.zone}
      </div>
      <div style={{ color: "#b7dcff", fontSize: 11 }}>Grouped Friends</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {invitedFriends.map((friend) => (
          <span key={friend} style={{ borderRadius: 999, border: "1px solid rgba(255,120,45,0.36)", padding: "3px 8px", color: "#ffd9b3", fontSize: 11 }}>
            {friend}
          </span>
        ))}
      </div>
    </div>
  );
}
