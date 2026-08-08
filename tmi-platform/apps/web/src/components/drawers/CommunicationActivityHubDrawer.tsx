"use client";

/**
 * CommunicationActivityHubDrawer — Phase 5.4 High-Fidelity Cyberpunk Communication Hub (Image 2 Match)
 * 9-Tile Structured Command Grid:
 *   Tile 1: Communication & Activity Hub (Conversation cards + neon chat speech bubbles)
 *   Tile 3: Active Calls (Video call avatar cards with status rings)
 *   Tile 4: Unified Connections & Tools (Glassmorphic chat stream)
 *   Tile 4 (Mid): Shared Media (Songs, Clips, YoPho Profile, Events)
 *   Tile 5: Invitations (Glowing neon envelope card with Accept / Decline / View)
 *   Tile 6: Lounge & Party (Current Lounge: Playlist Lounge 3, venue minimap)
 *   Tile 8: Connections & Tools (YoPho Profile Manager, Contact Groups, Event Scheduler, Bookmarks)
 *   Tile 9: Global Settings (Conversation tools & switches for Block Users, Filter Invitations, Read Receipts, Message Sounds)
 */

import { useState, type CSSProperties } from "react";
import UniversalDrawerBase from "./UniversalDrawerBase";
import { DRAWER_OPEN_HEIGHT } from "@/lib/drawers/DrawerAnimationProfile";

interface CommunicationActivityHubDrawerProps {
  open: boolean;
  onClose: () => void;
  displayName?: string;
}

export default function CommunicationActivityHubDrawer({
  open,
  onClose,
  displayName = "Jay Carter",
}: CommunicationActivityHubDrawerProps) {
  const [filterInvitations, setFilterInvitations] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [messageSounds, setMessageSounds] = useState(true);

  return (
    <UniversalDrawerBase
      open={open}
      animationId="mechanical"
      title="COMMUNICATION & ACTIVITY HUB"
      subtitle="Unified Messaging, Active Calls, Shared Media, Lounge Invites & Global Controls"
      onClose={onClose}
      accentColor="#00FFFF"
      mode="overlay"
      overlayHeight={DRAWER_OPEN_HEIGHT}
    >
      <div
        style={{
          flex: 1,
          padding: 14,
          background: "rgba(3,2,14,0.96)",
          display: "grid",
          gridTemplateColumns: "1.2fr 0.9fr 1.1fr",
          gridTemplateRows: "auto auto auto",
          gap: 12,
          overflowY: "auto",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
        }}
      >
        {/* TILE 1: Communication & Activity Hub */}
        <div style={hubCard("#00FFFF")}>
          <div style={hubHeader("#00FFFF")}>① Communication & Activity Hub</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", margin: "4px 0 8px" }}>Conversation Cards · Playlist Lounge 3</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={speechBubble("#00FFFF")}>💬</div>
            <div style={speechBubble("#FF2DAA")}>💬</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
            {["Jay", "Nova", "Luna", "Rico"].map((name) => (
              <div key={name} style={{ background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 6, fontSize: 8 }}>
                <strong style={{ color: "#00FFFF" }}>@{name}</strong>
                <div style={{ color: "rgba(255,255,255,0.4)", marginTop: 2 }}>"Ready for the Cypher..."</div>
              </div>
            ))}
          </div>
        </div>

        {/* TILE 3: Active Calls */}
        <div style={hubCard("#FF2DAA")}>
          <div style={hubHeader("#FF2DAA")}>③ Active Calls</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FF2DAA", border: "2px solid #00FFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              👤
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>Marshal Dickens</div>
              <div style={{ fontSize: 8, color: "#00FF88" }}>🟢 Active Call (2:44)</div>
            </div>
          </div>
        </div>

        {/* TILE 4: Unified Connections & Tools (Chat Stream) */}
        <div style={hubCard("#AA2DFF")}>
          <div style={hubHeader("#AA2DFF")}>④ Unified Connections & Tools</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            <div style={chatBubble("#00FFFF")}>Are you ready for the Cypher tonight?</div>
            <div style={chatBubble("#FF2DAA")}>Yes, analyzing the beat now. It's complex.</div>
            <div style={chatBubble("#AA2DFF")}>Great. Marshall is joining us too.</div>
            <div style={chatBubble("#00FF88")}>Confirming. Marshall's presence detected.</div>
          </div>
        </div>

        {/* TILE 4 MID: Shared Media */}
        <div style={hubCard("#FFD700")}>
          <div style={hubHeader("#FFD700")}>④ Shared Media</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 8, textAlign: "center" }}>
            <div style={mediaBadge("#00FFFF")}>🎵 Songs</div>
            <div style={mediaBadge("#FF2DAA")}>🎬 Clips</div>
            <div style={mediaBadge("#AA2DFF")}>🖼 YoPho</div>
            <div style={mediaBadge("#FFD700")}>🎟 Events</div>
          </div>
        </div>

        {/* TILE 5: Invitations */}
        <div style={hubCard("#00FF88")}>
          <div style={hubHeader("#00FF88")}>⑤ Invitations</div>
          <div style={{ textAlign: "center", padding: 10, background: "rgba(0,0,0,0.3)", borderRadius: 8, marginTop: 6 }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📩</div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>Sarah</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Walth Parby- Nestle & Pou / Vude Video</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              <button type="button" style={btnSmall("#00FF88")}>ACCEPT</button>
              <button type="button" style={btnSmall("#FF0055")}>DECLINE</button>
              <button type="button" style={btnSmall("#00FFFF")}>VIEW ROOM</button>
            </div>
          </div>
        </div>

        {/* TILE 6: Lounge & Party */}
        <div style={hubCard("#00FFFF")}>
          <div style={hubHeader("#00FFFF")}>⑥ Lounge & Party</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", margin: "4px 0 6px" }}>Current Lounge: Playlist Lounge 3</div>
          <div style={{ height: 60, background: "rgba(0,0,0,0.5)", borderRadius: 6, border: "1px solid rgba(0,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
            🗺 Venue Minimap Active
          </div>
          <button type="button" style={{ ...btnSmall("#00FFFF"), width: "100%", marginTop: 6 }}>
            👥 JOIN PARTY
          </button>
        </div>

        {/* TILE 8: Connections & Tools */}
        <div style={hubCard("#AA2DFF")}>
          <div style={hubHeader("#AA2DFF")}>⑧ Connections & Tools</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, fontSize: 9 }}>
            <div>🖼 <strong>YoPho Profile Manager</strong></div>
            <div>👥 <strong>Contact Groups</strong></div>
            <div>📅 <strong>Event Scheduler</strong></div>
            <div>🔖 <strong>Bookmark Manager</strong></div>
          </div>
        </div>

        {/* TILE 9: Global Settings */}
        <div style={hubCard("#FFD700")}>
          <div style={hubHeader("#FFD700")}>⑨ Global Settings</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6, fontSize: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Filter Invitations</span>
              <button type="button" onClick={() => setFilterInvitations(!filterInvitations)} style={toggleBtn(filterInvitations)}>
                {filterInvitations ? "ON" : "OFF"}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Read Receipts</span>
              <button type="button" onClick={() => setReadReceipts(!readReceipts)} style={toggleBtn(readReceipts)}>
                {readReceipts ? "ON" : "OFF"}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Message Sounds</span>
              <button type="button" onClick={() => setMessageSounds(!messageSounds)} style={toggleBtn(messageSounds)}>
                {messageSounds ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </UniversalDrawerBase>
  );
}

function hubCard(color: string): CSSProperties {
  return {
    background: "rgba(8,5,22,0.85)",
    border: `1px solid ${color}44`,
    borderRadius: 12,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    boxShadow: `0 0 15px ${color}12`,
  };
}

function hubHeader(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.12em",
    color,
    paddingBottom: 4,
    borderBottom: `1px solid ${color}22`,
  };
}

function speechBubble(color: string): CSSProperties {
  return {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: `${color}20`,
    border: `1px solid ${color}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  };
}

function chatBubble(color: string): CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 8,
    background: `${color}15`,
    border: `1px solid ${color}44`,
    fontSize: 9,
    color: "#fff",
  };
}

function mediaBadge(color: string): CSSProperties {
  return {
    padding: "8px 4px",
    borderRadius: 6,
    background: `${color}15`,
    border: `1px solid ${color}44`,
    fontSize: 9,
    fontWeight: 800,
    color,
  };
}

function btnSmall(color: string): CSSProperties {
  return {
    fontSize: 8,
    fontWeight: 900,
    padding: "4px 8px",
    borderRadius: 4,
    border: `1px solid ${color}`,
    background: `${color}20`,
    color,
    cursor: "pointer",
  };
}

function toggleBtn(active: boolean): CSSProperties {
  return {
    fontSize: 8,
    fontWeight: 900,
    padding: "2px 6px",
    borderRadius: 4,
    border: active ? "1px solid #00FF88" : "1px solid rgba(255,255,255,0.2)",
    background: active ? "rgba(0,255,136,0.2)" : "transparent",
    color: active ? "#00FF88" : "rgba(255,255,255,0.4)",
    cursor: "pointer",
  };
}
