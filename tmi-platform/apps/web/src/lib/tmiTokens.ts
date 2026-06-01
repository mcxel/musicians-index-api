// TMI Design Tokens — BerntoutGlobal · The Musician's Index · Visual DNA v1.0
// DO NOT MODIFY — locked palette per Platform Law #2

export const C = {
  bg:          "#050815",
  panel:       "rgba(8,14,38,.95)",
  card:        "rgba(12,20,50,.90)",
  red:         "#E63000",
  orange:      "#FF6B00",
  amber:       "#FF8C00",
  gold:        "#FFD700",
  border:      "rgba(220,70,0,.50)",
  borderBright:"#E63000",
  dim:         "rgba(255,140,0,.40)",
  green:       "#00FF7F",
  cyan:        "#00E5FF",
  pink:        "#FF2DAA",
  purple:      "#9B59B6",
  white:       "#FFFFFF",
} as const;

export const FONTS = {
  display: "'Orbitron', sans-serif",
  body:    "'Exo 2', sans-serif",
} as const;

export const FONT_IMPORT =
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap";

export const KEYFRAMES = `
  @keyframes tmiMq    { 0%,100%{opacity:1;box-shadow:0 0 7px #FFD700,0 0 14px #FF6B00} 50%{opacity:.25} }
  @keyframes tmiMqB   { 0%,100%{opacity:.25} 50%{opacity:1;box-shadow:0 0 7px #FFD700,0 0 14px #FF6B00} }
  @keyframes tmiBlink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes tmiSway  { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
  @keyframes tmiFloat { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-80px) scale(.2);opacity:0} }
  @keyframes tmiTicker{ from{transform:translateX(110%)} to{transform:translateX(-110%)} }
  @keyframes tmiFlick { 0%,93%,100%{text-shadow:0 0 12px #E63000,0 0 24px rgba(230,48,0,.4)} 94%,99%{text-shadow:none} }
  @keyframes tmiPulse { 0%,100%{box-shadow:0 0 4px #E63000} 50%{box-shadow:0 0 18px #E63000,0 0 36px rgba(230,48,0,.3)} }
  @keyframes tmiSpin  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes tmiArrow { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
  @keyframes tmiWinGlow { 0%,100%{box-shadow:0 0 8px #FFD700} 50%{box-shadow:0 0 24px #FFD700,0 0 48px rgba(255,215,0,.4)} }
`;

export const BOT_STATUSES = {
  active: "#00FF7F",
  busy:   "#FFD700",
  idle:   "rgba(255,140,0,.4)",
  error:  "#E63000",
} as const;

export const ARENA_COLORS = {
  battle:    "#FF2DAA",
  cypher:    "#00E5FF",
  challenge: "#FFD700",
} as const;
