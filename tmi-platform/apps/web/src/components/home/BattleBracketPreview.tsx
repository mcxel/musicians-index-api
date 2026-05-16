const BRACKETS = [
  ["Wavetek", "Crown Rae"],
  ["Lyric 44", "Nova Thread"],
  ["Beat Chief", "Zuri V"],
  ["MC Kinetik", "Sona Dee"],
];

export default function BattleBracketPreview() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {BRACKETS.map((pair, index) => (
        <div key={`${pair[0]}-${pair[1]}`} style={{ borderRadius: 10, border: "1px solid rgba(255,45,170,0.35)", padding: 9, background: "rgba(20,8,19,0.78)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#fce7f3", fontWeight: 800 }}>{pair[0]}</span>
          <span style={{ fontSize: 9, color: "#fb7185", fontWeight: 900, letterSpacing: "0.12em" }}>VS</span>
          <span style={{ fontSize: 10, color: "#fce7f3", fontWeight: 800, textAlign: "right" }}>{pair[1]}</span>
        </div>
      ))}
    </div>
  );
}
