"use client";

export type PassFailStatus = "pass" | "fail" | "warn" | "pending" | "skip";

export interface PassFailItem {
  id: string;
  label: string;
  status: PassFailStatus;
  detail?: string;
  group?: string;
}

const STATUS_COLOR: Record<PassFailStatus, string> = {
  pass: "#00FF88",
  fail: "#FF2D2D",
  warn: "#FFD700",
  pending: "rgba(255,255,255,0.3)",
  skip: "rgba(255,255,255,0.15)",
};

const STATUS_ICON: Record<PassFailStatus, string> = {
  pass: "✓",
  fail: "✗",
  warn: "⚠",
  pending: "·",
  skip: "–",
};

interface PassFailGridProps {
  items: PassFailItem[];
  columns?: 2 | 3 | 4;
  title?: string;
  showSummary?: boolean;
}

export function PassFailGrid({ items, columns = 3, title, showSummary = true }: PassFailGridProps) {
  const pass = items.filter((i) => i.status === "pass").length;
  const fail = items.filter((i) => i.status === "fail").length;
  const warn = items.filter((i) => i.status === "warn").length;
  const pending = items.filter((i) => i.status === "pending").length;

  const groups = items.reduce<Record<string, PassFailItem[]>>((acc, item) => {
    const g = item.group ?? "Uncategorized";
    acc[g] = acc[g] ?? [];
    acc[g].push(item);
    return acc;
  }, {});

  const hasGroups = Object.keys(groups).length > 1 || (Object.keys(groups).length === 1 && Object.keys(groups)[0] !== "Uncategorized");

  return (
    <div style={{ fontFamily: "inherit" }}>
      {(title || showSummary) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          {title && <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{title}</div>}
          {showSummary && (
            <div style={{ display: "flex", gap: 10, fontSize: 9, fontWeight: 700 }}>
              <span style={{ color: "#00FF88" }}>{pass} PASS</span>
              <span style={{ color: "#FFD700" }}>{warn} WARN</span>
              <span style={{ color: "#FF2D2D" }}>{fail} FAIL</span>
              {pending > 0 && <span style={{ color: "rgba(255,255,255,0.3)" }}>{pending} PENDING</span>}
            </div>
          )}
        </div>
      )}

      {hasGroups ? (
        Object.entries(groups).map(([group, groupItems]) => (
          <div key={group} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>{group}</div>
            <GridBlock items={groupItems} columns={columns} />
          </div>
        ))
      ) : (
        <GridBlock items={items} columns={columns} />
      )}
    </div>
  );
}

function GridBlock({ items, columns }: { items: PassFailItem[]; columns: 2 | 3 | 4 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 6 }}>
      {items.map((item) => {
        const color = STATUS_COLOR[item.status];
        return (
          <div key={item.id} title={item.detail}
            style={{ display: "flex", gap: 7, alignItems: "flex-start", padding: "7px 9px", borderRadius: 7, border: `1px solid ${color}25`, background: `${color}07`, cursor: item.detail ? "help" : "default" }}>
            <span style={{ fontSize: 9, fontWeight: 900, color, flexShrink: 0, width: 12, textAlign: "center", marginTop: 1 }}>
              {STATUS_ICON[item.status]}
            </span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{item.label}</div>
              {item.detail && (
                <div style={{ fontSize: 9, color: color, marginTop: 2, lineHeight: 1.4 }}>{item.detail}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
