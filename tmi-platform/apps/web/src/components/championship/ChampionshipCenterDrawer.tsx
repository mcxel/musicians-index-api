"use client";

/**
 * Championship Center — ESPN-style hub (Phase 2C).
 * Drawer id: championship_center
 */

import { useMemo, useState } from "react";
import {
  getChallengeQueue,
  getDefenseWarning,
  listChampionshipTitles,
  listTitlesByAssetType,
  type ChampionshipTitle,
} from "@/lib/championship";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import ChampionshipChallengeCard from "./ChampionshipChallengeCard";
import TitleLineageTimeline from "./TitleLineageTimeline";
import LivingRankingsPanel from "./LivingRankingsPanel";
import HallOfFameSection from "./HallOfFameSection";
import ChampionshipBroadcastOverlay from "./ChampionshipBroadcastOverlay";
import FanRubricVotingPanel from "@/components/voting/FanRubricVotingPanel";
import { getGuestId } from "@/lib/identity/getGuestId";

type SectionId =
  | "crowns"
  | "belts"
  | "world"
  | "defenses"
  | "challenges"
  | "vacant"
  | "hof"
  | "rankings"
  | "lineage";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "crowns", label: "Current Crowns" },
  { id: "belts", label: "Belts" },
  { id: "world", label: "World Champions" },
  { id: "defenses", label: "Upcoming Defenses" },
  { id: "challenges", label: "Open Challenges" },
  { id: "vacant", label: "Vacant Titles" },
  { id: "hof", label: "Hall of Fame" },
  { id: "rankings", label: "Living Rankings" },
  { id: "lineage", label: "Lineage" },
];

export interface ChampionshipCenterDrawerProps {
  userId: string;
  role: "fan" | "performer";
  displayName?: string;
  accentColor?: string;
}

export default function ChampionshipCenterDrawer({
  userId,
  role,
  displayName,
  accentColor = "#FFD700",
}: ChampionshipCenterDrawerProps) {
  const { resolvePerformerId, activePerformer, activePerformerId } = useActivePerformer();
  const contextId =
    role === "performer" ? resolvePerformerId(userId) ?? userId : userId;
  const [section, setSection] = useState<SectionId>("crowns");
  const [lineageTitleId, setLineageTitleId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [rubricVoterId] = useState(() => getGuestId());

  const titles = useMemo(() => listChampionshipTitles(), [tick]);
  const crowns = useMemo(() => listTitlesByAssetType("CROWN"), [tick]);
  const belts = useMemo(() => listTitlesByAssetType("BELT"), [tick]);
  const trophies = useMemo(() => listTitlesByAssetType("TROPHY"), [tick]);

  const activeCrowns = crowns.filter((t) => t.status === "ACTIVE" && t.currentHolderId);
  const activeBelts = belts.filter((t) => t.status === "ACTIVE" && t.currentHolderId);
  const worldChamps = titles.filter(
    (t) =>
      t.geographicTier === "GLOBAL" &&
      t.status === "ACTIVE" &&
      Boolean(t.currentHolderId),
  );
  const vacant = titles.filter((t) => t.status === "VACANT");
  const upcomingDefenses = titles
    .filter((t) => t.status === "ACTIVE" && t.defenseDeadline && t.currentHolderId)
    .map((t) => ({ title: t, warning: getDefenseWarning(t) }))
    .filter((x) => x.warning.daysRemaining != null)
    .sort(
      (a, b) => (a.warning.daysRemaining ?? 999) - (b.warning.daysRemaining ?? 999),
    );

  const openChallenges = useMemo(() => {
    return getChallengeQueue().filter(
      (c) => c.status === "queued" || c.status === "eligible",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const lineageTitle =
    titles.find((t) => t.id === lineageTitleId) ??
    activeCrowns[0] ??
    titles.find((t) => t.lineage.length > 0) ??
    null;

  const empty = (msg: string) => (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        border: "1px dashed rgba(255,255,255,0.15)",
        fontSize: 11,
        color: "rgba(255,255,255,0.4)",
        lineHeight: 1.5,
      }}
    >
      {msg}
    </div>
  );

  const renderTitleList = (list: ChampionshipTitle[], vacantMsg: string) => {
    if (list.length === 0) return empty(vacantMsg);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.slice(0, 16).map((title) => (
          <div key={title.id}>
            <ChampionshipChallengeCard
              title={title}
              challengerId={role === "performer" ? contextId : undefined}
              role={role}
              onChallengeResult={() => setTick((n) => n + 1)}
            />
            <button
              type="button"
              onClick={() => {
                setLineageTitleId(title.id);
                setSection("lineage");
              }}
              style={{
                marginTop: 4,
                fontSize: 9,
                fontWeight: 800,
                color: accentColor,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "2px 0",
              }}
            >
              View lineage →
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}
      key={`cc-${contextId}`}
    >
      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: accentColor,
          }}
        >
          CHAMPIONSHIP CENTER
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
          {activePerformer?.name ?? displayName ?? contextId} · ESPN hub · registry-backed
        </div>
      </div>

      <ChampionshipBroadcastOverlay
        performerId={activePerformerId ?? (role === "performer" ? contextId : null)}
        triggerKey={section}
      />

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {SECTIONS.map((s) => {
          const active = section === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.04em",
                padding: "5px 8px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                border: active ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.12)",
                background: active ? `${accentColor}22` : "transparent",
                color: active ? accentColor : "rgba(255,255,255,0.45)",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {section === "crowns" &&
        renderTitleList(
          activeCrowns.length > 0 ? activeCrowns : crowns.filter((t) => t.status === "VACANT").slice(0, 8),
          "No active crowns. Genre crowns remain VACANT until verified holders exist.",
        )}

      {section === "crowns" && activeCrowns.length === 0 ? (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
          Showing vacant crown slots — honest empty for unverified categories.
        </div>
      ) : null}

      {section === "belts" &&
        renderTitleList(
          activeBelts.length > 0 ? activeBelts : belts.filter((t) => t.status === "VACANT").slice(0, 8),
          "No active belts. Weekly belts seed VACANT until verified wins crown a holder.",
        )}

      {section === "world" &&
        (worldChamps.length === 0
          ? empty(
              "No World Champions on record. GLOBAL ACTIVE titles with verified holders appear here.",
            )
          : renderTitleList(worldChamps, "No World Champions."))}

      {section === "defenses" &&
        (upcomingDefenses.length === 0
          ? empty("No upcoming defense windows. Active titles with deadlines appear here.")
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcomingDefenses.map(({ title, warning }) => {
                const holder = title.currentHolderId
                  ? getPerformerById(title.currentHolderId)
                  : null;
                return (
                  <div
                    key={title.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid rgba(255,107,53,0.35)",
                      background: "rgba(255,107,53,0.08)",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#FF6B35" }}>
                      {title.label}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                      {holder?.name ?? "Holder"} · {warning.daysRemaining} day
                      {warning.daysRemaining === 1 ? "" : "s"} remaining
                      {warning.level === "warning" ? " · WARNING" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

      {section === "challenges" &&
        (openChallenges.length === 0
          ? empty(
              "No open challenges queued. Performers need verified competition wins to challenge.",
            )
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {openChallenges.map((c) => {
                const title = titles.find((t) => t.id === c.titleId);
                const challenger = getPerformerById(c.challengerId);
                return (
                  <div
                    key={c.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid rgba(0,255,136,0.3)",
                      background: "rgba(0,255,136,0.06)",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#00FF88" }}>
                      {title?.label ?? c.titleId}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
                      Challenger: {challenger?.name ?? c.challengerId} · {c.status}
                    </div>
                    {c.reason ? (
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                        {c.reason}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

      {/* Belt / crown challenge rubric — opens when a real holder + challenger pair exists */}
      {(section === "belts" || section === "challenges") &&
        (() => {
          const challenge = openChallenges[0];
          const title = challenge
            ? titles.find((t) => t.id === challenge.titleId)
            : activeBelts[0] ?? activeCrowns[0];
          const holderId = title?.currentHolderId;
          const challengerId = challenge?.challengerId;
          if (!holderId || !challengerId || holderId === challengerId) return null;
          const holder = getPerformerById(holderId);
          const challenger = getPerformerById(challengerId);
          return (
            <FanRubricVotingPanel
              roomId={`championship-${title?.id ?? "belt"}`}
              eventId={challenge?.id ?? `defense-${title?.id}`}
              performerIds={[holderId, challengerId]}
              performerLabels={{
                [holderId]: holder?.name ?? "Champion",
                [challengerId]: challenger?.name ?? "Challenger",
              }}
              voterId={rubricVoterId}
              votingOpen
            />
          );
        })()}

      {section === "vacant" &&
        (vacant.length === 0
          ? empty("No vacant titles.")
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {vacant.slice(0, 24).map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  <span style={{ color: "#FF6B35", fontWeight: 900 }}>VACANT</span>{" "}
                  {t.label} · {t.assetType} · {t.category}
                </div>
              ))}
              {vacant.length > 24 ? (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  +{vacant.length - 24} more vacant
                </div>
              ) : null}
            </div>
          ))}

      {section === "hof" && (
        <HallOfFameSection
          focusPerformerId={activePerformerId ?? (role === "performer" ? contextId : null)}
          accentColor={accentColor}
        />
      )}

      {section === "rankings" && (
        <LivingRankingsPanel
          accentColor="#00D4FF"
          anchorPerformerId={activePerformerId ?? contextId}
        />
      )}

      {section === "lineage" &&
        (lineageTitle ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: accentColor }}>
              {lineageTitle.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
              {titles
                .filter((t) => t.lineage.length > 0 || t.id === lineageTitle.id)
                .slice(0, 12)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setLineageTitleId(t.id)}
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border:
                        t.id === lineageTitle.id
                          ? `1px solid ${accentColor}`
                          : "1px solid rgba(255,255,255,0.12)",
                      background:
                        t.id === lineageTitle.id ? `${accentColor}22` : "transparent",
                      color:
                        t.id === lineageTitle.id
                          ? accentColor
                          : "rgba(255,255,255,0.45)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
            </div>
            <TitleLineageTimeline lineage={lineageTitle.lineage} accentColor={accentColor} />
          </div>
        ) : (
          empty("No title lineage available. Lineage fills when verified holders are recorded.")
        ))}

      {/* Quiet trophy count for ESPN strip honesty */}
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", marginTop: 4 }}>
        Registry · {crowns.length} crowns · {belts.length} belts · {trophies.length} trophy slots ·{" "}
        {vacant.length} vacant
      </div>
    </div>
  );
}
