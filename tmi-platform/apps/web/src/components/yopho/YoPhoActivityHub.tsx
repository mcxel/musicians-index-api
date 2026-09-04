"use client";

/**
 * YoPho activity hub — first surface when YOPHO is tapped.
 * Tiles open existing workspaces/overlays only. No invented routes.
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import RoleGate from "@/components/auth/RoleGate";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  listVisibleYoPhoActivities,
  type YoPhoHubRole,
} from "@/lib/yopho/YoPhoActivityRegistry";
import { yoPhoCanvasPathForRole } from "@/lib/yopho/yophoCanvasAccess";
import {
  interactiveCardPath,
  listPublishedCardsLocal,
  type PublishedYoPhoCard,
} from "@/lib/yopho/YoPhoCardRegistry";
import {
  listCollectedEditions,
  listEditionsForCreator,
  type YoPhoEditionRecord,
  type YoPhoCollectorRecord,
} from "@/lib/yopho/YoPhoEditionEngine";
import {
  FREE_DEFAULT_CHASSIS_ID,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import {
  equipChassisApi,
  getEquippedChassisId,
  getOwnedChassisIds,
  hydrateMediaPlayerOwnership,
} from "@/lib/artifacts/MediaPlayerInventory";
import type { PlaylistCardSkinSelection } from "@/components/yopho/PlaylistCardSkinSelector";
import type { CommandCenterRole } from "@/components/commandCenter/commandCenterRegistry";
import { normalizeYoPhoTier } from "@/lib/yopho/YoPhoImageCapacity";

const YoPhoFanPortraitWorkspace = dynamic(
  () => import("@/components/yopho/YoPhoFanPortraitWorkspace"),
  { ssr: false, loading: () => <HubLoading label="Loading portrait studio…" /> },
);
const YoPhoTradingCard = dynamic(() => import("@/components/yopho/YoPhoTradingCard"), {
  ssr: false,
  loading: () => <HubLoading label="Loading card editor…" /> },
);
const PlaylistCardSkinSelector = dynamic(
  () => import("@/components/yopho/PlaylistCardSkinSelector"),
  { ssr: false, loading: () => <HubLoading label="Loading player skins…" /> },
);
const MarketplaceDrawerPanel = dynamic(
  () => import("@/components/drawers/MarketplaceDrawerPanel"),
  { ssr: false, loading: () => <HubLoading label="Loading marketplace…" /> },
);
const YoReleaseShelf = dynamic(() => import("@/components/yopho/YoReleaseShelf"), {
  ssr: false,
  loading: () => <HubLoading label="Loading releases…" /> },
);

const FUCHSIA = "#FF2DAA";
const CYAN = "#00FFFF";
const GOLD = "#FFD700";

export interface YoPhoActivityHubProps {
  role: CommandCenterRole;
  userId: string;
  displayName: string;
  slug?: string;
}

type OpenActivityId = "create_card" | "view_collection" | "skin_selector" | "marketplace" | null;

function HubLoading({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: 24,
        color: "rgba(255,255,255,0.4)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textAlign: "center",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}

function tileStyle(accent: string): CSSProperties {
  return {
    width: "100%",
    minHeight: 88,
    padding: "16px 18px",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: 14,
    border: `1px solid ${accent}55`,
    background: "rgba(8, 6, 20, 0.92)",
    color: "#fff",
    fontFamily: "inherit",
    boxShadow: `0 0 18px ${accent}22`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 6,
    boxSizing: "border-box",
  };
}

export default function YoPhoActivityHub({
  role,
  userId,
  displayName,
  slug,
}: YoPhoActivityHubProps) {
  const hubRole: YoPhoHubRole = role === "performer" ? "performer" : "fan";
  const tiles = useMemo(() => listVisibleYoPhoActivities(hubRole), [hubRole]);
  const [openId, setOpenId] = useState<OpenActivityId>(null);
  const [narrow, setNarrow] = useState(true);

  useEffect(() => {
    const sync = () => setNarrow(window.innerWidth < 720);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const canvasHref = yoPhoCanvasPathForRole(hubRole === "performer" ? "PERFORMER" : "FAN");

  return (
    <div
      data-yopho-activity-hub
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height: "100%",
        minHeight: "min(68vh, 620px)",
        maxHeight: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        background: "#050510",
      }}
    >
      <div
        style={{
          height: "100%",
          overflowY: openId ? "hidden" : "auto",
          overflowX: "hidden",
          padding: narrow ? "12px 12px 20px" : "14px 16px 20px",
          boxSizing: "border-box",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: FUCHSIA }}>
          YOPHO
        </div>
        <div style={{ fontSize: narrow ? 22 : 16, fontWeight: 900, color: "#fff", marginTop: 4 }}>
          Choose an activity
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4, marginBottom: 14 }}>
          {hubRole === "fan"
            ? "Fan portrait canvas · cards you create and collect"
            : "Performer living card · editions you publish"}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: narrow ? "1fr" : "1fr 1fr",
            gap: 12,
          }}
        >
          {tiles.map((tile) => {
            const accent =
              tile.id === "create_card"
                ? FUCHSIA
                : tile.id === "marketplace"
                  ? GOLD
                  : tile.id === "skin_selector"
                    ? CYAN
                    : "#AA2DFF";
            return (
              <button
                key={tile.id}
                type="button"
                data-yopho-activity={tile.id}
                onClick={() => setOpenId(tile.id as OpenActivityId)}
                style={tileStyle(accent)}
              >
                <span style={{ fontSize: narrow ? 18 : 14, fontWeight: 900, letterSpacing: "0.04em" }}>
                  {tile.label}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.35 }}>
                  {tile.capability}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {openId ? (
        <div
          data-yopho-activity-overlay
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            width: "100%",
            height: "100%",
            maxWidth: "100vw",
            maxHeight: "100%",
            overflow: "hidden",
            background: "#050510",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderBottom: "1px solid rgba(255,45,170,0.28)",
              background: "rgba(4, 6, 16, 0.96)",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenId(null)}
              style={{
                minHeight: 44,
                padding: "8px 14px",
                borderRadius: 10,
                border: `1px solid ${CYAN}66`,
                background: "transparent",
                color: CYAN,
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ← HUB
            </button>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", color: FUCHSIA, flex: 1 }}>
              {tiles.find((t) => t.id === openId)?.label ?? "YOPHO"}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {openId === "create_card" ? (
              <CreateCardWorkspace
                hubRole={hubRole}
                userId={userId}
                displayName={displayName}
                slug={slug}
                canvasHref={canvasHref}
              />
            ) : null}
            {openId === "view_collection" ? (
              <CollectionWorkspace
                userId={userId}
                hubRole={hubRole}
                onCreate={() => setOpenId("create_card")}
              />
            ) : null}
            {openId === "skin_selector" ? (
              <RoleGate
                allow={["FAN", "ADMIN", "STAFF"]}
                fallback={
                  <div style={{ padding: 24, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                    Player skins are Fan-only (Rule 26 / Rule 19 Fan store).
                  </div>
                }
              >
                <SkinSelectorWorkspace userId={userId} />
              </RoleGate>
            ) : null}
            {openId === "marketplace" ? (
              <MarketplaceWorkspace ownerSlug={slug} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CreateCardWorkspace({
  hubRole,
  userId,
  displayName,
  slug,
  canvasHref,
}: {
  hubRole: YoPhoHubRole;
  userId: string;
  displayName: string;
  slug?: string;
  canvasHref: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ padding: "8px 12px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Link
          href={canvasHref}
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: CYAN,
            textDecoration: "none",
            border: `1px solid ${CYAN}55`,
            borderRadius: 8,
            padding: "10px 12px",
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Full canvas →
        </Link>
      </div>
      {hubRole === "fan" ? (
        <YoPhoFanPortraitWorkspace userId={userId} displayName={displayName} compact />
      ) : null}
      <div style={{ padding: "0 8px 16px" }}>
        <YoPhoTradingCard
          role={hubRole}
          displayName={displayName}
          userKey={userId}
          slug={slug}
          compact
          showEditor
          showShare
          showMoneyCtas={hubRole === "performer"}
        />
      </div>
    </div>
  );
}

function CollectionWorkspace({
  userId,
  hubRole,
  onCreate,
}: {
  userId: string;
  hubRole: YoPhoHubRole;
  onCreate: () => void;
}) {
  const [localCards, setLocalCards] = useState<PublishedYoPhoCard[]>([]);
  const [apiCards, setApiCards] = useState<PublishedYoPhoCard[]>([]);
  const [editions, setEditions] = useState<YoPhoEditionRecord[]>([]);
  const [collected, setCollected] = useState<YoPhoCollectorRecord[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setLocalCards(listPublishedCardsLocal());
    setEditions(listEditionsForCreator(userId));
    setCollected(hubRole === "fan" ? listCollectedEditions(userId) : []);
    fetch("/api/yopho/cards", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const cards = Array.isArray(data.cards) ? (data.cards as PublishedYoPhoCard[]) : [];
        setApiCards(cards);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, hubRole]);

  const mine = useMemo(() => {
    const byId = new Map<string, PublishedYoPhoCard>();
    for (const c of localCards) byId.set(c.cardId, c);
    for (const c of apiCards) {
      if (c.ownerKey === userId) byId.set(c.cardId, c);
    }
    return Array.from(byId.values());
  }, [localCards, apiCards, userId]);

  const publicCards = useMemo(() => {
    const seen = new Set(mine.map((c) => c.cardId));
    return apiCards.filter((c) => !seen.has(c.cardId));
  }, [apiCards, mine]);

  const empty = mine.length === 0 && publicCards.length === 0 && editions.length === 0 && collected.length === 0;

  return (
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={onCreate} style={ctaBtn(FUCHSIA)}>
          Create card
        </button>
        <button
          type="button"
          onClick={() => document.getElementById("yopho-public-cards")?.scrollIntoView({ behavior: "smooth" })}
          style={ctaBtn(CYAN)}
        >
          Browse public
        </button>
      </div>

      {loadState === "loading" ? <HubLoading label="Loading collection…" /> : null}
      {loadState === "error" ? (
        <div style={{ fontSize: 12, color: GOLD }}>Could not reach the public card list. Device cards still show below.</div>
      ) : null}

      {empty && loadState !== "loading" ? (
        <div
          style={{
            padding: 20,
            borderRadius: 12,
            border: "1px dashed rgba(255,45,170,0.35)",
            color: "rgba(255,255,255,0.55)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          No public YoPho cards yet. Create a card in the studio, or browse when other members publish.
        </div>
      ) : null}

      {mine.length > 0 ? (
        <CardList title="Your cards" cards={mine} />
      ) : null}

      {editions.length > 0 ? (
        <section>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: GOLD, marginBottom: 8 }}>
            YOUR EDITIONS
          </div>
          {editions.map((ed) => (
            <Link
              key={ed.id}
              href={interactiveCardPath(ed.id)}
              style={rowLink()}
            >
              <span style={{ fontWeight: 800, color: "#fff" }}>{ed.title}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                {ed.status} · #{ed.editionNumber}
              </span>
            </Link>
          ))}
        </section>
      ) : null}

      {collected.length > 0 ? (
        <section>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: CYAN, marginBottom: 8 }}>
            COLLECTED
          </div>
          {collected.map((c) => (
            <Link key={`${c.fanUserId}-${c.editionId}`} href={interactiveCardPath(c.editionId)} style={rowLink()}>
              <span style={{ fontWeight: 800, color: "#fff" }}>Edition {c.editionId.slice(0, 12)}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Open card →</span>
            </Link>
          ))}
        </section>
      ) : null}

      <section id="yopho-public-cards">
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: FUCHSIA, marginBottom: 8 }}>
          PUBLIC CARDS
        </div>
        {publicCards.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>No public YoPho cards yet.</div>
        ) : (
          <CardList title="" cards={publicCards} />
        )}
      </section>
    </div>
  );
}

function CardList({ title, cards }: { title: string; cards: PublishedYoPhoCard[] }) {
  return (
    <section>
      {title ? (
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#AA2DFF", marginBottom: 8 }}>
          {title.toUpperCase()}
        </div>
      ) : null}
      {cards.map((card) => (
        <Link key={card.cardId} href={interactiveCardPath(card.cardId)} style={rowLink()}>
          <span style={{ fontWeight: 800, color: "#fff" }}>
            {card.editionTitle || card.moodTitle || card.displayName}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{card.displayName} →</span>
        </Link>
      ))}
    </section>
  );
}

function SkinSelectorWorkspace({ userId }: { userId: string }) {
  const { tier } = useAuth();
  const accountTier = normalizeYoPhoTier(tier);
  const [owned, setOwned] = useState<MediaPlayerChassisId[]>([]);
  const [current, setCurrent] = useState<PlaylistCardSkinSelection>({
    chassisId: FREE_DEFAULT_CHASSIS_ID,
    accentOverride: null,
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    hydrateMediaPlayerOwnership(userId).then((state) => {
      if (cancelled) return;
      setOwned(state.ownedChassisIds);
      setCurrent((prev) => ({ ...prev, chassisId: state.equippedChassisId }));
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const onChange = useCallback(
    (next: PlaylistCardSkinSelection) => {
      setCurrent(next);
      setOwned(getOwnedChassisIds(userId));
      void equipChassisApi(userId, next.chassisId).then((res) => {
        if (res.ok) {
          setCurrent((prev) => ({ ...prev, chassisId: getEquippedChassisId(userId) }));
          setStatus("Equipped");
        } else {
          setStatus(res.message ?? "Could not equip this chassis");
        }
      });
    },
    [userId],
  );

  return (
    <div style={{ padding: 8 }}>
      <div style={{ padding: "8px 8px 0", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
        Media player chassis — Fan store cosmetics. Beat licenses are not sold here.
      </div>
      {status ? (
        <div style={{ padding: "6px 8px", fontSize: 11, color: GOLD, fontWeight: 700 }}>{status}</div>
      ) : null}
      <PlaylistCardSkinSelector
        accountTier={accountTier}
        ownedChassisIds={owned}
        current={current}
        onChange={onChange}
      />
    </div>
  );
}

function MarketplaceWorkspace({ ownerSlug }: { ownerSlug?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <MarketplaceDrawerPanel accentColor={GOLD} />
      {ownerSlug ? (
        <div style={{ padding: "0 8px 16px" }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: FUCHSIA, padding: "8px 8px 0" }}>
            YO ARTIFACT RELEASES
          </div>
          <YoReleaseShelf ownerSlug={ownerSlug} />
        </div>
      ) : (
        <div style={{ padding: "8px 16px 20px", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.45 }}>
          YoArtifact releases appear when you open a performer who has locked cards for sale. No invented listings.
        </div>
      )}
    </div>
  );
}

function ctaBtn(accent: string): CSSProperties {
  return {
    minHeight: 44,
    padding: "10px 16px",
    borderRadius: 10,
    border: `1px solid ${accent}`,
    background: `${accent}18`,
    color: accent,
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  };
}

function rowLink(): CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    padding: "14px 12px",
    minHeight: 52,
    marginBottom: 8,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    textDecoration: "none",
    background: "rgba(255,255,255,0.03)",
  };
}
