import Link from "next/link";
import { getYearlyBoard, getYearlyBoardSummary, type YearlyOKR } from "@/lib/directives/YearlyDirectiveEngine";

const PILLAR_COLORS: Record<YearlyOKR["pillar"], string> = {
  growth:      "#00FF88",
  revenue:     "#FFD700",
  content:     "#00FFFF",
  community:   "#FF2DAA",
  technology:  "#AA2DFF",
  brand:       "#FF8C00",
};

export default function YearlyDirectivePage() {
  const board = getYearlyBoard();
  const summary = getYearlyBoardSummary();

  const pillars: YearlyOKR["pillar"][] = ["growth", "revenue", "content", "community", "technology", "brand"];
  const grouped = pillars.reduce<Record<YearlyOKR["pillar"], YearlyOKR[]>>((acc, p) => {
    acc[p] = board.okrs.filter(o => o.pillar === p);
    return acc;
  }, {} as Record<YearlyOKR["pillar"], YearlyOKR[]>);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/admin/directives" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>← Directives</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 6px", fontWeight: 700 }}>Yearly OKR Board — {board.year}</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{summary}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 30, marginTop: 20 }}>
          {[
            { label: "Artist Target EOY", value: board.artistTargetEOY.toLocaleString() },
            { label: "Fan Target EOY", value: board.fanTargetEOY.toLocaleString() },
            { label: "Revenue Target EOY", value: `$${board.revenueTargetEOY.toLocaleString()}` },
            { label: "Articles EOY", value: board.articleTargetEOY },
            { label: "Battles EOY", value: board.battleTargetEOY },
            { label: "Platform Version", value: board.platformVersionTarget },
          ].map(stat => (
            <div key={stat.label} style={{ border: "1px solid rgba(170,45,255,0.2)", borderRadius: 10, padding: "12px 14px", background: "rgba(170,45,255,0.04)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: "#AA2DFF" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 24 }}>
          {pillars.map(pillar => (
            grouped[pillar].length === 0 ? null : (
              <div key={pillar}>
                <div style={{ fontSize: 11, color: PILLAR_COLORS[pillar], textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
                  {pillar} pillar
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {grouped[pillar].map(okr => (
                    <div key={okr.id} style={{ border: `1px solid ${PILLAR_COLORS[pillar]}33`, borderRadius: 12, padding: "16px 18px", background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{okr.objective}</div>
                      <ul style={{ margin: 0, paddingLeft: 16, listStyle: "none" }}>
                        {okr.keyResults.map((kr, i) => (
                          <li key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 5, display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ color: PILLAR_COLORS[pillar], marginTop: 1 }}>◆</span>
                            {kr}
                          </li>
                        ))}
                      </ul>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>
                        Owner: {okr.owner.replace("_", " ")} · Target: {okr.targetYear}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </main>
  );
}
