"use client";

// ── Pure SVG chart components — no external library needed ──────────────────

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

// ── Bar Chart ───────────────────────────────────────────────────────────────
interface BarChartProps {
  data: DataPoint[];
  height?: number;
  accentColor?: string;
  showValues?: boolean;
  title?: string;
  unit?: string;
}

export function BarChart({ data, height = 140, accentColor = "#00FFFF", showValues = true, title, unit = "" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = 100 / data.length;
  const pad = barW * 0.18;

  return (
    <div style={{ width: "100%" }}>
      {title && <div style={{ fontSize: 9, letterSpacing: "0.2em", color: accentColor, fontWeight: 800, marginBottom: 8 }}>{title}</div>}
      <svg width="100%" height={height} style={{ overflow: "visible" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1="0%" x2="100%"
            y1={`${(1 - pct) * (height - 24)}px`}
            y2={`${(1 - pct) * (height - 24)}px`}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1}
          />
        ))}
        {data.map((d, i) => {
          const barH = ((d.value / max) * (height - 24));
          const x = `${i * barW + pad}%`;
          const w = `${barW - pad * 2}%`;
          const y = height - 24 - barH;
          const color = d.color ?? accentColor;
          return (
            <g key={d.label}>
              {/* Bar glow */}
              <rect x={x} y={y} width={w} height={barH} rx={3}
                fill={color} opacity={0.15} />
              {/* Bar fill */}
              <rect x={x} y={y} width={w} height={barH} rx={3}
                fill={color} opacity={0.75} />
              {/* Top highlight */}
              <rect x={x} y={y} width={w} height={2} rx={1}
                fill={color} opacity={1} />
              {/* Value */}
              {showValues && barH > 16 && (
                <text x={`${i * barW + barW / 2}%`} y={y - 4}
                  textAnchor="middle" fontSize={8} fill={color} fontWeight={800} fontFamily="Inter, sans-serif">
                  {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}K` : d.value}{unit}
                </text>
              )}
              {/* Label */}
              <text x={`${i * barW + barW / 2}%`} y={height - 6}
                textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.45)" fontFamily="Inter, sans-serif">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Line Chart ───────────────────────────────────────────────────────────────
interface LineChartProps {
  data: DataPoint[];
  height?: number;
  accentColor?: string;
  title?: string;
  unit?: string;
  fill?: boolean;
}

export function LineChart({ data, height = 120, accentColor = "#00FFFF", title, unit = "", fill = true }: LineChartProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const W = 400;
  const H = height - 28;
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((d.value - min) / range) * H,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const fillPath = `M${pts[0]!.x},${H} ${pts.map((p) => `L${p.x},${p.y}`).join(" ")} L${pts[pts.length - 1]!.x},${H} Z`;

  return (
    <div style={{ width: "100%" }}>
      {title && <div style={{ fontSize: 9, letterSpacing: "0.2em", color: accentColor, fontWeight: 800, marginBottom: 8 }}>{title}</div>}
      <svg width="100%" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`fill-grad-${accentColor.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {/* Grid */}
        {[0, 0.5, 1].map((pct) => (
          <line key={pct} x1={0} x2={W} y1={H * pct} y2={H * pct} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        ))}
        {/* Fill area */}
        {fill && <path d={fillPath} fill={`url(#fill-grad-${accentColor.replace("#", "")})`} />}
        {/* Line */}
        <polyline points={polyline} fill="none" stroke={accentColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={accentColor} />
        ))}
        {/* Labels */}
        {data.map((d, i) => (
          <text key={i} x={pts[i]!.x} y={height - 4} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.4)" fontFamily="Inter, sans-serif">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Pie / Donut Chart ────────────────────────────────────────────────────────
interface PieChartProps {
  data: DataPoint[];
  size?: number;
  title?: string;
  donut?: boolean;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function PieChart({ data, size = 120, title, donut = true }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const ir = donut ? r * 0.55 : 0;

  let cumAngle = 0;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { ...d, start, angle };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {title && <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", fontWeight: 800, marginBottom: 8, textAlign: "center" }}>{title}</div>}
      <svg width={size} height={size}>
        {slices.map((s, i) => {
          if (s.angle < 0.5) return null;
          const large = s.angle > 180 ? 1 : 0;
          const p1 = polarToXY(cx, cy, r, s.start);
          const p2 = polarToXY(cx, cy, r, s.start + s.angle);
          const i1 = polarToXY(cx, cy, ir, s.start);
          const i2 = polarToXY(cx, cy, ir, s.start + s.angle);

          const d = donut
            ? `M${p1.x},${p1.y} A${r},${r} 0 ${large} 1 ${p2.x},${p2.y} L${i2.x},${i2.y} A${ir},${ir} 0 ${large} 0 ${i1.x},${i1.y} Z`
            : `M${cx},${cy} L${p1.x},${p1.y} A${r},${r} 0 ${large} 1 ${p2.x},${p2.y} Z`;

          return (
            <g key={i}>
              <path d={d} fill={s.color ?? "#00FFFF"} opacity={0.85} />
              <path d={d} fill="none" stroke="rgba(5,5,16,0.6)" strokeWidth={1.5} />
            </g>
          );
        })}
        {donut && (
          <circle cx={cx} cy={cy} r={ir - 2} fill="#050510" />
        )}
        {donut && (
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#fff" fontFamily="Inter, sans-serif">
            {total >= 1000000 ? `${(total / 1000000).toFixed(1)}M` : total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total}
          </text>
        )}
      </svg>
      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", justifyContent: "center", marginTop: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color ?? "#00FFFF", flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Horizontal Bar / Progress Bar ────────────────────────────────────────────
interface HBarChartProps {
  data: DataPoint[];
  title?: string;
  unit?: string;
  showPct?: boolean;
}

export function HBarChart({ data, title, unit = "", showPct = false }: HBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ width: "100%" }}>
      {title && <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 10 }}>{title}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const color = d.color ?? "#00FFFF";
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{d.label}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color }}>
                  {showPct ? `${pct.toFixed(1)}%` : `${d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}K` : d.value}${unit}`}
                </span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, transition: "width 0.8s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sparkline ────────────────────────────────────────────────────────────────
interface SparklineProps {
  values: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function Sparkline({ values, color = "#00FFFF", height = 32, width = 80 }: SparklineProps) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(values.length - 1) / (values.length - 1) * width} cy={height - ((values[values.length - 1]! - min) / range) * height} r={2.5} fill={color} />
    </svg>
  );
}

// ── Stat Card with Sparkline ──────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  color?: string;
  sparkValues?: number[];
}

export function StatCard({ label, value, change, positive = true, color = "#00FFFF", sparkValues }: StatCardProps) {
  return (
    <div style={{ padding: "14px 16px", background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
        {change && (
          <div style={{ fontSize: 9, fontWeight: 700, color: positive ? "#00FF88" : "#FF4444", marginTop: 4 }}>
            {positive ? "▲" : "▼"} {change}
          </div>
        )}
      </div>
      {sparkValues && (
        <Sparkline values={sparkValues} color={color} height={30} width={60} />
      )}
    </div>
  );
}
