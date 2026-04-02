// apps/web/src/components/rewards/ — All reward display components

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", gold:"#FFB800", cyan:"#00E5FF", pink:"#FF2D78", purple:"#7B2FBE", teal:"#00C896", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

// ── REWARD TOAST (bottom-right notification) ──────────────
export function RewardToast({ rewardType, title, value, rarityColor = T.gold }: {
  rewardType: string; title: string; value: string; rarityColor?: string;
}) {
  return (
    <div style={{
      position: "fixed", bottom: 80, right: 16, zIndex: 9999,
      background: T.deep, border: `2px solid ${rarityColor}`,
      boxShadow: `0 0 24px ${rarityColor}66`,
      borderRadius: 12, padding: "12px 16px",
      display: "flex", gap: 12, alignItems: "center",
      animation: "slideInRight 0.3s ease",
      minWidth: 240, maxWidth: 320,
    }}>
      <div style={{ fontSize: 32 }}>
        {rewardType === "points" ? "⚡" : rewardType === "avatar_item" ? "👑" : rewardType === "mystery_box" ? "📦" : "🎁"}
      </div>
      <div>
        <div style={{ fontFamily: T.heading, fontSize: 10, color: rarityColor, letterSpacing: 1.5, marginBottom: 2 }}>YOU WON!</div>
        <div style={{ fontFamily: T.heading, fontSize: 13, color: T.text, marginBottom: 2 }}>{title}</div>
        <div style={{ fontFamily: T.display, fontSize: 18, color: rarityColor }}>{value}</div>
      </div>
    </div>
  );
}

// ── PRIZE DROP BANNER (full-width live alert) ─────────────
export function PrizeDropBanner({ message, sponsorName, ctaLabel, onClaim }: {
  message: string; sponsorName?: string; ctaLabel: string; onClaim: () => void;
}) {
  return (
    <div style={{
      background: `linear-gradient(90deg, ${T.pink}, ${T.purple})`,
      padding: "10px 20px", display: "flex", alignItems: "center", gap: 12,
      animation: "pulseGlow 1s infinite alternate",
    }}>
      <span style={{ fontSize: 24 }}>🎁</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.display, fontSize: 18, color: T.text, letterSpacing: 1 }}>{message}</div>
        {sponsorName && <div style={{ fontFamily: T.heading, fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 1 }}>Sponsored by {sponsorName}</div>}
      </div>
      <button onClick={onClaim} style={{
        padding: "8px 20px", background: T.gold, color: T.void, border: "none",
        borderRadius: 6, fontFamily: T.heading, fontSize: 12, fontWeight: 700,
        cursor: "pointer", letterSpacing: 1, whiteSpace: "nowrap",
      }}>{ctaLabel}</button>
    </div>
  );
}

// ── LIVE PROMPT CARD (audience challenge) ─────────────────
export function LivePromptCard({ promptType, question, windowSeconds, rewardPreview, onSubmit }: {
  promptType: string; question: string; windowSeconds: number;
  rewardPreview: string; onSubmit: (answer: string) => void;
}) {
  return (
    <div style={{
      background: T.card, border: `2px solid ${T.cyan}`,
      boxShadow: `0 0 20px ${T.cyan}44`, borderRadius: 12,
      padding: 20, textAlign: "center",
    }}>
      <div style={{ fontFamily: T.heading, fontSize: 10, color: T.cyan, letterSpacing: 2, marginBottom: 8 }}>
        {promptType === "trivia" ? "⚡ FASTEST ANSWER WINS" : promptType === "reaction" ? "👆 TAP FIRST!" : "🎯 CHALLENGE"}
      </div>
      <div style={{ fontFamily: T.display, fontSize: 22, color: T.text, marginBottom: 12 }}>{question}</div>
      <div style={{ fontFamily: T.heading, fontSize: 11, color: T.gold, marginBottom: 16 }}>WIN: {rewardPreview}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => onSubmit("react")} style={{ padding: "10px 24px", background: T.cyan, color: T.void, border: "none", borderRadius: 8, fontFamily: T.heading, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          TAP TO CLAIM
        </button>
      </div>
      <div style={{ fontFamily: T.heading, fontSize: 9, color: T.text3, marginTop: 8 }}>
        {windowSeconds}s window
      </div>
    </div>
  );
}

// ── WINNER CARD (displayed when someone wins) ─────────────
export function WinnerCard({ displayName, avatarUrl, rewardTitle, isCurrentUser }: {
  displayName: string; avatarUrl?: string; rewardTitle: string; isCurrentUser: boolean;
}) {
  return (
    <div style={{
      background: isCurrentUser ? `linear-gradient(135deg, ${T.gold}22, ${T.deep})` : T.card,
      border: `2px solid ${isCurrentUser ? T.gold : T.text3}`,
      boxShadow: isCurrentUser ? `0 0 30px ${T.gold}55` : "none",
      borderRadius: 12, padding: 20, textAlign: "center",
    }}>
      {isCurrentUser && <div style={{ fontFamily: T.display, fontSize: 28, color: T.gold, letterSpacing: 3, marginBottom: 8 }}>YOU WON!</div>}
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.raised, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `2px solid ${isCurrentUser ? T.gold : T.text3}` }}>
        {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", borderRadius: "50%" }} /> : "👤"}
      </div>
      <div style={{ fontFamily: T.heading, fontSize: 14, color: T.text, marginBottom: 4 }}>{displayName}</div>
      <div style={{ fontFamily: T.heading, fontSize: 10, color: T.gold, letterSpacing: 1 }}>{rewardTitle}</div>
    </div>
  );
}

// ── INVENTORY GRID ────────────────────────────────────────
export function InventoryGrid({ items, onEquip, onSelect }: {
  items: Array<{ id: string; name: string; emoji: string; rarity: string; isEquipped: boolean; isNew: boolean }>;
  onEquip: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const RARITY_COLORS: Record<string, string> = { COMMON: "#C8A8E8", UNCOMMON: "#00C896", RARE: "#00E5FF", EPIC: "#7B2FBE", LEGENDARY: "#FFB800", EXCLUSIVE: "#FF2D78" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
      {items.map(item => (
        <div key={item.id} onClick={() => onSelect(item.id)} style={{
          background: T.card, border: `1px solid ${RARITY_COLORS[item.rarity] || T.text3}44`,
          borderRadius: 8, padding: 10, textAlign: "center", cursor: "pointer",
          position: "relative",
          boxShadow: item.isEquipped ? `0 0 12px ${RARITY_COLORS[item.rarity]}55` : "none",
        }}>
          {item.isNew && <div style={{ position: "absolute", top: 4, right: 4, background: T.pink, borderRadius: 99, width: 8, height: 8 }} />}
          <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
          <div style={{ fontFamily: T.heading, fontSize: 9, color: RARITY_COLORS[item.rarity], letterSpacing: 1, marginBottom: 4 }}>{item.rarity}</div>
          <div style={{ fontFamily: T.heading, fontSize: 10, color: T.text, marginBottom: 6 }}>{item.name}</div>
          {item.isEquipped ? (
            <div style={{ fontFamily: T.heading, fontSize: 9, color: T.teal, letterSpacing: 1 }}>EQUIPPED</div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onEquip(item.id); }} style={{ width: "100%", padding: "4px", background: "rgba(255,255,255,0.1)", border: `1px solid ${T.text3}`, borderRadius: 4, fontFamily: T.heading, fontSize: 9, color: T.text2, cursor: "pointer" }}>EQUIP</button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── ROOM WINNER TICKER (scrolling live feed) ──────────────
export function RoomWinnerTicker({ winners }: { winners: Array<{ name: string; reward: string; time: string }> }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.5)", padding: "6px 12px", display: "flex", gap: 20, overflow: "hidden" }}>
      {winners.map((w, i) => (
        <span key={i} style={{ fontFamily: T.heading, fontSize: 11, color: T.gold, whiteSpace: "nowrap" }}>
          🎁 <strong>{w.name}</strong> won {w.reward} · {w.time}
        </span>
      ))}
    </div>
  );
}
