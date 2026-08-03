"use client";

/**
 * Achievement Center — Phase 2B.
 * Tabs: Trophies · Crowns · Belts · Achievements · Streaks · XP/Levels · Points · Career Timeline
 * Championship challenge CTA when eligible (verified wins required — honest empty otherwise).
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listChampionshipTitles,
  listTitlesByAssetType,
  listTitlesForHolder,
  type ChampionshipTitle,
} from "@/lib/championship";
import {
  getProgressionSnapshot,
  wireProgressionCommandBus,
} from "@/lib/progression/ProgressionEngine";
import {
  getLatestCeremonyPulse,
  onCeremonyPulse,
  wireCeremonyDirector,
  type CeremonyPulse,
} from "@/lib/ceremony/CeremonyDirector";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import CreatorCareerTimeline from "@/components/championship/CreatorCareerTimeline";
import ChampionshipChallengeCard from "@/components/championship/ChampionshipChallengeCard";

type TabId =
  | "trophies"
  | "crowns"
  | "belts"
  | "achievements"
  | "streaks"
  | "xp"
  | "points"
  | "timeline";

const TABS: { id: TabId; label: string }[] = [
  { id: "crowns", label: "Crowns" },
  { id: "belts", label: "Belts" },
  { id: "trophies", label: "Trophies" },
  { id: "achievements", label: "Achievements" },
  { id: "streaks", label: "Streaks" },
  { id: "xp", label: "XP / Levels" },
  { id: "points", label: "Points" },
  { id: "timeline", label: "Career Timeline" },
];

export interface AchievementCenterDrawerProps {
  userId: string;
  role: "fan" | "performer";
  displayName?: string;
  accentColor?: string;
}

export default function AchievementCenterDrawer({
  userId,
  role,
  displayName,
  accentColor = "#FFD700",
}: AchievementCenterDrawerProps) {
  const { resolvePerformerId, activePerformer } = useActivePerformer();
  const contextId =
    role === "performer" ? resolvePerformerId(userId) ?? userId : userId;
  const [tab, setTab] = useState<TabId>("crowns");
  const [pulse, setPulse] = useState<CeremonyPulse | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    wireCeremonyDirector();
    wireProgressionCommandBus();
    setPulse(getLatestCeremonyPulse());
    let clearTimer: number | undefined;
    const unsub = onCeremonyPulse((p) => {
      setPulse(p);
      if (clearTimer) window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(() => setPulse(null), 3200);
    });
    return () => {
      unsub();
      if (clearTimer) window.clearTimeout(clearTimer);
    };
  }, []);

  const snap = useMemo(
    () => getProgressionSnapshot(contextId),
    // tick forces refresh after challenge / ceremony
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contextId, tick, pulse?.id],
  );
  const crowns = useMemo(() => listTitlesByAssetType("CROWN"), [tick]);
  const belts = useMemo(() => listTitlesByAssetType("BELT"), [tick]);
  const trophies = useMemo(() => listTitlesByAssetType("TROPHY"), [tick]);
  const held = useMemo(
    () => listTitlesForHolder(contextId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contextId, tick],
  );

  const empty = (msg: string) => (
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, padding: "8px 0" }}>
      {msg}
    </div>
  );

  const listForTab = (): ChampionshipTitle[] => {
    if (tab === "crowns") return crowns;
    if (tab === "belts") return belts;
    if (tab === "trophies") return trophies;
    return [];
  };

  return (
    <div
      style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}
      key={`ach-${contextId}`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>
            ACHIEVEMENT CENTER
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            {activePerformer?.name ?? displayName ?? contextId} · Lv {snap.level} ·{" "}
            {held.length} title{held.length === 1 ? "" : "s"} held
          </div>
        </div>
      </div>

      <AnimatePresence>
        {pulse ? (
          <motion.div
            key={pulse.id}
            className={pulse.cssClass}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${pulse.accent}`,
              background: `${pulse.accent}22`,
              color: pulse.accent,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.06em",
            }}
          >
            {pulse.label}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.05em",
                padding: "5px 8px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                border: active ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.12)",
                background: active ? `${accentColor}22` : "transparent",
                color: active ? accentColor : "rgba(255,255,255,0.45)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {(tab === "crowns" || tab === "belts" || tab === "trophies") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {listForTab().length === 0
            ? empty("No titles seeded.")
            : listForTab()
                .slice(0, 12)
                .map((title) => (
                  <ChampionshipChallengeCard
                    key={title.id}
                    title={title}
                    challengerId={contextId}
                    role={role}
                    onChallengeResult={() => setTick((n) => n + 1)}
                  />
                ))}
          {listChampionshipTitles().length > 0 && tab === "crowns" ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
              Showing first 12 · Genre crowns seed VACANT until verified holders exist.
            </div>
          ) : null}
        </div>
      )}

      {tab === "achievements" &&
        (snap.achievementIds.length === 0
          ? empty("No achievements unlocked yet. Wins and milestones appear here when earned.")
          : (
            <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
              {snap.achievementIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          ))}

      {tab === "streaks" &&
        empty("No active streaks yet. Daily login and competition form streaks will appear when tracked.")}

      {tab === "xp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <StatRow label="XP" value={String(snap.xp)} color="#AA2DFF" />
          <StatRow label="Level" value={String(snap.level)} color="#AA2DFF" />
          <StatRow
            label="Daily XP"
            value={`${snap.dailyXpEarned} / ${snap.dailyXpCap}`}
            color="rgba(255,255,255,0.55)"
          />
          <StatRow label="Ranking Score" value={String(snap.rankingScore)} color="#00D4FF" />
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
            Ranking Score is competitive only. Commerce sales ({snap.commerceSalesScore}) stay on
            the commerce leaderboard — never the championship ladder.
          </div>
        </div>
      )}

      {tab === "points" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <StatRow label="TMI Points" value={String(snap.points)} color="#00FF88" />
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
            Spendable points. Points do not feed championship eligibility or ranking score.
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <CreatorCareerTimeline userId={contextId} accentColor="#AA2DFF" maxEntries={30} />
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const style: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${color}44`,
    background: `${color}10`,
    fontSize: 12,
    fontWeight: 800,
    color,
  };
  return (
    <div style={style}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
