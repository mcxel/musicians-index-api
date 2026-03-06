export const dynamic = "force-dynamic";

type HubInfo = {
  name: string;
  url: string;
  status: "up" | "down" | "unknown";
  lastCheckedAt?: string;
  version?: string;
};

async function fetchRegistry(): Promise<HubInfo[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/hub/registry`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { hubs?: HubInfo[] } | HubInfo[];
    return Array.isArray(data) ? data : (data.hubs ?? []);
  } catch {
    return [];
  }
}

export default async function HubWallPage() {
  const hubs = await fetchRegistry();

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Hub Wall</h1>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Live registry of hubs (TMI, StreamWin, ThunderWorld, etc.). This grid should be kiosk-safe and low-lag.
      </p>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {hubs.length === 0 ? (
          <div style={card()}>
            <div style={{ fontWeight: 800 }}>No hubs loaded yet</div>
            <div style={{ opacity: 0.8, marginTop: 6 }}>
              Scaffold ready. Wire `/api/hub/registry` to merge `hubs.json` + live status checks.
            </div>
          </div>
        ) : (
          hubs.map((h) => (
            <div key={`${h.name}:${h.url}`} style={card()}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900 }}>{h.name}</div>
                <div style={badge(h.status)}>{h.status.toUpperCase()}</div>
              </div>

              <div style={{ opacity: 0.85, marginTop: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12 }}>
                {h.url}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={h.url} target="_blank" rel="noreferrer" style={miniBtn()}>
                  Open →
                </a>
                <a href="/hud?mode=wallboard&rotate=10" style={miniBtn()}>
                  HUD Wallboard →
                </a>
              </div>

              <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
                {h.lastCheckedAt ? `Last check: ${h.lastCheckedAt}` : "Last check: (not yet)"}{" "}
                {h.version ? `· v${h.version}` : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function card(): React.CSSProperties {
  return {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    padding: 14,
  };
}
function badge(status: HubInfo["status"]): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "3px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.2)",
    opacity: 0.9,
  };
  if (status === "up") return { ...base };
  if (status === "down") return { ...base, opacity: 0.65 };
  return { ...base, opacity: 0.5 };
}
function miniBtn(): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(0,0,0,0.18)",
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 12,
    display: "inline-block",
  };
}
