"use client";

/**
 * Command Center bottom drawer — Universal Drawer Base + per-module animation.
 * Fan: Avatar Lobby, YoPho, playlists, memory, inventory, live destinations, room controls,
 *      prize_vault, tickets, favorites.
 * Performer: Media Locker, Beat Lab, Performer YoPho, booking, stage, store.
 * Never mounts Fan Lobby ownership / Avatar Studio for performers.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useEffect, useRef, type CSSProperties } from "react";
import { presentInstantGoLiveInPlace } from "@/lib/dock/presentInstantGoLiveInPlace";
import YoPhoActivityHub from "@/components/yopho/YoPhoActivityHub";
import RoleGate from "@/components/auth/RoleGate";
import UniversalDrawerBase from "@/components/drawers/UniversalDrawerBase";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import { InventoryCanister } from "@/components/canisters/InventoryCanister";
import MediaLockerCanister from "@/components/canisters/MediaLockerCanister";
import { BookingCanister } from "@/components/canisters/BookingCanister";
import NotificationCanister from "@/components/canisters/NotificationCanister";
import QueueCanister from "@/components/canisters/QueueCanister";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import SubmissionsCanister from "@/components/canisters/SubmissionsCanister";
import ScoresCanister from "@/components/canisters/ScoresCanister";
import ThemeEditorPanel from "@/components/shell/ThemeEditorPanel";
import { DEFAULT_FAN_LOBBY_SKIN_ID } from "@/lib/lobby/FanLobbySkinRegistry";
import { defaultRoomAuthority } from "@/lib/lobby/FanLobbyPresence";
import { animationForDrawerModule } from "@/lib/drawers/UniversalDrawerRegistry";
import { drawerStateStore, useDrawerState, type AnalyticsPeriod, ANALYTICS_PERIOD_LABELS } from "@/lib/drawers/drawerStateStore";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import LiveDestinationsDrawerPanel from "./LiveDestinationsDrawerPanel";
import RoomControlsDrawerPanel from "./RoomControlsDrawerPanel";
import PerformerCurtainControlPanel from "@/components/performer/PerformerCurtainControlPanel";
import PerformerBioMagazineDrawer from "@/components/drawers/PerformerBioMagazineDrawer";
import CreatorCommerceCenterDrawer from "@/components/drawers/CreatorCommerceCenterDrawer";
import MarketplaceDrawerPanel from "@/components/drawers/MarketplaceDrawerPanel";
import ShopDrawerPanel from "@/components/drawers/ShopDrawerPanel";
import AchievementCenterDrawer from "@/components/drawers/AchievementCenterDrawer";
import ChampionshipCenterDrawer from "@/components/championship/ChampionshipCenterDrawer";
import CreatorAssetVaultPanel from "@/components/drawers/CreatorAssetVaultPanel";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { wireProgressionCommandBus } from "@/lib/progression/ProgressionEngine";
import { wireCeremonyDirector } from "@/lib/ceremony/CeremonyDirector";
import { recordRelationshipEvent } from "@/lib/commerce/CreatorRelationshipEngine";
import type { CommandCenterPanelId, CommandCenterRole } from "./commandCenterRegistry";
import {
  FAN_COMMAND_PANELS,
  FAN_DRAWER_SWAP_PANELS,
  PERFORMER_COMMAND_PANELS,
  PERFORMER_DRAWER_SWAP_PANELS,
  isFanOnlyPanel,
  panelsForRole,
} from "./commandCenterRegistry";
import { useTheme } from "@/lib/design/ThemeEngine";
import { resolveFanWorldEntry } from "@/lib/live/canonicalWorldViewport";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";

const FanLobbyVenue = dynamic(() => import("@/components/live/FanLobbyVenue"), {
  ssr: false,
  loading: () => <SlotLoading label="Loading Avatar Lobby…" />,
});


function SlotLoading({ label }: { label: string }) {
  return (
    <div
      style={{
        minHeight: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.35)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}

function YoPhoSlot({
  role,
  displayName,
  userId,
  bindKey,
  slug,
}: {
  role: CommandCenterRole;
  displayName: string;
  userId: string;
  /** ACTIVE_PERFORMER bind — remounts hub without full page reload. */
  bindKey?: string;
  slug?: string;
}) {
  return (
    <div key={bindKey ?? userId} style={{ height: "100%", minHeight: 360 }}>
      <YoPhoActivityHub role={role} displayName={displayName} userId={userId} slug={slug} />
    </div>
  );
}

// ─── Analytics Drawer (multi-period, honest-empty until backend is wired) ─────


const REVENUE_SOURCES_PERFORMER = [
  "Bookings", "Tickets", "Tips", "Merchandise", "Sponsorships",
  "Advertising", "Media Sales", "Beat Licensing", "Memberships", "Prizes",
];

const ENGAGEMENT_SOURCES_FAN = [
  "Tickets Purchased", "Merchandise", "Tips Sent", "Avatar Items",
  "YoPho Items", "Memberships", "Donations", "Prizes Claimed",
];

function AnalyticsEmptyPeriod({ label }: { label: string }) {
  return (
    <div style={{ padding: "6px 0", textAlign: "center", color: "rgba(255,255,255,0.28)", fontSize: 11, lineHeight: 1.5 }}>
      No {label.toLowerCase()} records yet.
    </div>
  );
}

function AnalyticsStub({
  role,
  bindKey,
  subjectLabel,
}: {
  role: CommandCenterRole;
  /** ACTIVE_PERFORMER bind key — remounts without page reload. */
  bindKey?: string;
  subjectLabel?: string;
}) {
  const drawerState = useDrawerState();
  const period = role === "performer" ? drawerState.analyticsPeriodPerformer : drawerState.analyticsPeriodFan;
  const sources = role === "performer" ? REVENUE_SOURCES_PERFORMER : ENGAGEMENT_SOURCES_FAN;
  const color = role === "performer" ? "#FFD700" : "#9B59FF";
  const heading = role === "performer" ? "ANALYTICS & REVENUE" : "STATS & ACTIVITY";

  return (
    <RoleGate
      allow={role === "performer" ? ["PERFORMER", "ARTIST", "ADMIN", "STAFF"] : ["FAN", "ADMIN", "STAFF"]}
      fallback={
        <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          Analytics requires a signed-in {role === "performer" ? "Performer" : "Fan"} session.
        </div>
      }
    >
      <div
        key={bindKey ?? role}
        style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color }}>
            {heading}
            {subjectLabel ? ` · ${subjectLabel}` : ""}
          </div>
          <Link href={role === "performer" ? "/performer/analytics" : "/fan/stats"}
            style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Full Report →
          </Link>
        </div>

        {/* Period selector */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(Object.keys(ANALYTICS_PERIOD_LABELS) as AnalyticsPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => drawerStateStore.setAnalyticsPeriod(role, p)}
              style={{
                padding: "3px 8px",
                background: period === p ? color : "#0A0A1A",
                border: `1px solid ${period === p ? color : "#1E1E45"}`,
                borderRadius: 4,
                color: period === p ? (role === "performer" ? "#000" : "#fff") : "rgba(255,255,255,0.4)",
                fontSize: 8,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {ANALYTICS_PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Summary row — honest empty until real data is wired */}
        <div style={{
          background: "#0A0A1A",
          border: `1px solid ${color}33`,
          borderRadius: 8,
          padding: 12,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
            {ANALYTICS_PERIOD_LABELS[period]} · {role === "performer" ? "Total Revenue" : "Total Activity"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "rgba(255,255,255,0.2)" }}>—</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", marginTop: 4 }}>
            No records yet. Data will appear once your first {role === "performer" ? "sale" : "activity"} is recorded.
          </div>
        </div>

        {/* Revenue sources breakdown — structure visible, values honest-empty */}
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)" }}>
          {role === "performer" ? "REVENUE BY SOURCE" : "ACTIVITY BY TYPE"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {sources.map((src) => (
            <div key={src} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", flex: 1 }}>{src}</div>
              <div style={{ height: 4, width: 80, background: "#1A1A40", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "0%", background: color, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontVariantNumeric: "tabular-nums", minWidth: 28, textAlign: "right" }}>—</div>
            </div>
          ))}
        </div>
        <AnalyticsEmptyPeriod label={ANALYTICS_PERIOD_LABELS[period]} />
      </div>
    </RoleGate>
  );
}

function SponsorsStubFan() {
  return (
    <RoleGate
      allow={["FAN", "ADMIN", "STAFF"]}
      fallback={
        <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          Sign in as a Fan to view sponsor / advertise paths.
        </div>
      }
    >
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
          Fan sponsor drawer redesign deferred. Advertise path stays live.
        </p>
        <Link
          href="/sponsors/advertise"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,215,0,0.45)",
            color: "#FFD700",
            fontWeight: 800,
            fontSize: 12,
            textDecoration: "none",
            width: "fit-content",
          }}
        >
          Advertise here →
        </Link>
      </div>
    </RoleGate>
  );
}

interface CommandCenterDrawerProps {
  role: CommandCenterRole;
  activePanel: CommandCenterPanelId | null;
  /** Special panel: shell appearance (ThemeEngine) */
  appearanceOpen?: boolean;
  userId: string;
  displayName: string;
  onClose: () => void;
  /** Swap module inside the open drawer without navigating away */
  onSelectPanel?: (id: CommandCenterPanelId) => void;
  /** Deep-link playlist selection for Playlist drawer */
  initialPlaylistId?: string | null;
}

export default function CommandCenterDrawer({
  role,
  activePanel,
  appearanceOpen = false,
  userId,
  displayName,
  onClose,
  onSelectPanel,
  initialPlaylistId = null,
}: CommandCenterDrawerProps) {
  const theme = useTheme();
  const { resolvePerformerId, activePerformerId, activePerformer } = useActivePerformer();
  /** Context-bound performer for Marketplace / Shop / booking / bio / analytics. */
  const contextPerformerId = resolvePerformerId(role === "performer" ? userId : null);
  const contextPerformer =
    (contextPerformerId ? getPerformerById(contextPerformerId) : null) ?? null;
  const contextDisplayName =
    activePerformer?.name ?? contextPerformer?.name ?? displayName;
  const contextSlug = activePerformer?.slug ?? contextPerformer?.slug ?? contextPerformerId ?? undefined;
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const inPlaceRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const fanWorld = useMemo(
    () =>
      resolveFanWorldEntry({
        publishedRoomId: publishedRoomId ?? inPlaceRoomId,
        from: "command-center-drawer",
      }),
    [publishedRoomId, inPlaceRoomId],
  );
  const roomId = role === "fan" ? fanWorld.roomId : `performer-lobby-cc-${userId}`;
  const open =
    appearanceOpen || (activePanel != null && activePanel !== "playlist");

  // ── Phase 2B: progression + ceremony + relationship hooks ─────────────────
  useEffect(() => {
    wireProgressionCommandBus();
    wireCeremonyDirector();
    const unsubYoPho = livingOsCommandBus.on("YOPHO_COLLECTED", (cmd) => {
      const fanId = cmd.userId;
      const creatorId =
        (cmd.payload?.creatorId as string | undefined) ??
        (cmd.payload?.performerId as string | undefined);
      if (!fanId || !creatorId) return;
      recordRelationshipEvent({
        type: "CollectedYoPho",
        fanId,
        creatorId,
        source: "YOPHO_COLLECTED",
      });
    });
    // Tip commerce — only when real purchase command carries tip semantics
    const unsubTip = livingOsCommandBus.on("ITEM_PURCHASED", (cmd) => {
      if (cmd.payload?.kind !== "tip") return;
      const fanId = cmd.userId;
      const creatorId = cmd.payload?.performerId as string | undefined;
      const amountCents = Number(cmd.payload?.amountCents ?? 0);
      if (!fanId || !creatorId || !Number.isFinite(amountCents)) return;
      recordRelationshipEvent({
        type: "Tip",
        fanId,
        creatorId,
        amountCents,
        source: "ITEM_PURCHASED",
      });
    });
    return () => {
      unsubYoPho();
      unsubTip();
    };
  }, []);

  // ── Observatory: drawer lifecycle telemetry (Living OS Command Bus) ────────
  const openedAtRef = useRef<number | null>(null);
  const prevPanelRef = useRef<typeof activePanel>(null);

  useEffect(() => {
    if (open && activePanel && prevPanelRef.current !== activePanel) {
      const isSwitch = prevPanelRef.current !== null;
      const commandType = isSwitch ? "DRAWER_SWITCHED" : "DRAWER_OPENED";
      openedAtRef.current = Date.now();
      livingOsCommandBus.dispatch({
        type: commandType,
        category: "navigation",
        userId,
        role,
        payload: { panelId: activePanel, fromPanel: prevPanelRef.current ?? undefined },
        idempotencyKey: `${commandType}-${activePanel}-${userId}`,
      });
    } else if (!open && openedAtRef.current !== null) {
      const openDurationMs = Date.now() - openedAtRef.current;
      livingOsCommandBus.dispatch({
        type: "DRAWER_CLOSED",
        category: "navigation",
        userId,
        role,
        payload: { panelId: prevPanelRef.current ?? undefined, openDurationMs },
      });
      openedAtRef.current = null;
    }
    prevPanelRef.current = activePanel;
  }, [open, activePanel, role, userId]);
  // ────────────────────────────────────────────────────────────────────────────

  const moduleId = appearanceOpen ? "appearance" : activePanel ?? "lobby";
  const animationId = animationForDrawerModule(moduleId);

  const TITLE_MAP: Partial<Record<CommandCenterPanelId, string>> = {
    lobby: "AVATAR FAN LOBBY · CINEMA",
    yopho: "YOPHO",
    media_locker: "MEDIA LOCKER",
    beat_lab: "BEAT LAB",
    booking: "BOOKINGS",
    stage_tools: "STAGE TOOLS",
    store: "SHOP · PERSONAL · TMI",
    marketplace: "MARKETPLACE · ACTIVE PERFORMER",
    sponsors: "SPONSORS",
    playlist: "PLAYLISTS",
    memory: "MEMORY WALL",
    inventory: "INVENTORY",
    live_destinations: "LIVE DESTINATIONS",
    room_controls: "ROOM CONTROLS",
    analytics: "ANALYTICS",
    appearance: "SHELL COLORS",
    messaging: "MESSAGES · COORDINATE → JOIN",
    notifications: "NOTIFICATIONS",
    queue: "QUEUE",
    submissions: role === "fan" ? "FAN SUBMISSIONS" : "SUBMISSIONS & BEAT LOCKER",
    scores: "UNIVERSAL LEADERBOARDS & SCORES",
    prize_vault: "PRIZE VAULT",
    tickets: "TICKETS & ORDERS",
    favorites: "FAVORITES",
    bio_magazine: "BIO & MAGAZINE",
    commerce_center: "COMMERCE CENTER",
    submission_center: "SUBMISSION CENTER",
    beat_marketplace: "BEAT MARKETPLACE",
    achievement_center: "ACHIEVEMENT CENTER",
    championship_center: "CHAMPIONSHIP CENTER",
    asset_vault: "CREATOR ASSET VAULT",
    shop_center: "SHOP CENTER",
    tmi_store: "TMI STORE",
  };
  const title = appearanceOpen
    ? "SHELL COLORS · THIS DEVICE"
    : (activePanel ? TITLE_MAP[activePanel] : undefined) ?? "DRAWER";

  const accent =
    (activePanel && panelsForRole(role).find((p) => p.id === activePanel)?.accent) ||
    theme.tertiary;

  // Block fan-only panels for performer role (defense in depth)
  if (activePanel && isFanOnlyPanel(activePanel) && role === "performer") {
    return null;
  }

  const swapPanelIds = role === "performer" ? PERFORMER_DRAWER_SWAP_PANELS : FAN_DRAWER_SWAP_PANELS;
  const swapPanelDefs = role === "performer" ? PERFORMER_COMMAND_PANELS : FAN_COMMAND_PANELS;
  const swapChips =
    !appearanceOpen && onSelectPanel ? (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 8 }}>
        {swapPanelIds.map((id) => {
          const def = swapPanelDefs.find((p) => p.id === id);
          if (!def) return null;
          const active = activePanel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectPanel(id)}
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.06em",
                padding: "4px 8px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                border: active ? `1px solid ${def.accent}` : "1px solid rgba(255,255,255,0.12)",
                background: active ? `${def.accent}22` : "transparent",
                color: active ? def.accent : "rgba(255,255,255,0.45)",
              }}
            >
              {def.label}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <UniversalDrawerBase
      open={open}
      animationId={animationId}
      title={title}
      subtitle={appearanceOpen ? "Saved on this device (ThemeEngine)" : undefined}
      onClose={onClose}
      mode="under_dashboard"
      headerExtra={swapChips}
      accentColor={accent}
      contentKey={
        appearanceOpen
          ? "appearance"
          : `${activePanel ?? "x"}:${activePerformerId ?? contextPerformerId ?? "none"}`
      }
    >
      {appearanceOpen ? (
        <div style={{ padding: 12 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 12px", padding: "0 4px" }}>
            Pick a shell palette for your Command Center. Changes apply instantly and persist on this device —
            not cloud-synced yet.
          </p>
          <ThemeEditorPanel accentColor={theme.primary} />
        </div>
      ) : null}

      {activePanel === "lobby" && role === "fan" ? (
        <RoleGate
          allow={["FAN", "ADMIN", "STAFF"]}
          fallback={
            <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              Avatar Fan Lobby is Fan-only (Rule 26).
            </div>
          }
        >
          <div style={{ height: "min(42vh, 460px)", minHeight: 300 }}>
            <FanLobbyVenue
              roomId={roomId}
              userName={displayName}
              initialSkinId={DEFAULT_FAN_LOBBY_SKIN_ID}
              roomType="FAN_LOBBY"
              embedded
            />
          </div>
        </RoleGate>
      ) : null}

      {activePanel === "yopho" ? (
        <YoPhoSlot
          role={role}
          displayName={role === "performer" ? contextDisplayName : displayName}
          userId={role === "performer" ? contextPerformerId ?? userId : userId}
          slug={role === "performer" ? contextSlug : undefined}
          bindKey={
            role === "performer"
              ? `yopho-${contextPerformerId ?? userId}`
              : `yopho-${userId}`
          }
        />
      ) : null}

      {activePanel === "memory" ? (
        <div style={{ padding: 12 }}>
          <MemoryWallCanister
            entityId={userId}
            entityType={role === "performer" ? "performer" : "fan"}
            accentColor={theme.secondary}
          />
        </div>
      ) : null}

      {activePanel === "live_destinations" ? (
        <LiveDestinationsDrawerPanel
          viewerUserId={userId}
          viewerRole={role === "performer" ? "PERFORMER" : "FAN"}
          accentColor={theme.primary}
        />
      ) : null}

      {activePanel === "room_controls" && role === "fan" ? (
        <RoomControlsDrawerPanel
          userId={userId}
          roomId={roomId}
          roomType="FAN_LOBBY"
          authority={defaultRoomAuthority("FAN_LOBBY", userId)}
          accentColor="#00FF88"
        />
      ) : null}

      {activePanel === "analytics" ? (
        <AnalyticsStub
          role={role}
          bindKey={
            role === "performer"
              ? `analytics-${contextPerformerId ?? userId}`
              : `analytics-${userId}`
          }
          subjectLabel={role === "performer" ? contextDisplayName : undefined}
        />
      ) : null}

      {activePanel === "inventory" && role === "fan" ? (
        <RoleGate allow={["FAN", "ADMIN", "STAFF"]} fallback={null}>
          <div style={{ padding: 12 }}>
            <InventoryCanister accentColor={theme.tertiary} />
          </div>
        </RoleGate>
      ) : null}

      {activePanel === "bio_magazine" && role === "performer" ? (
        <RoleGate
          allow={["PERFORMER", "ARTIST", "ADMIN", "STAFF"]}
          fallback={
            <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              Bio & Magazine requires a Performer session.
            </div>
          }
        >
          <PerformerBioMagazineDrawer
            key={`bio-${contextPerformerId ?? userId}`}
            userId={contextPerformerId ?? userId}
            performerSlug={contextSlug}
            displayName={contextDisplayName}
            accentColor="#00FFFF"
            showRequestInterview={false}
            onOpenCommerceCenter={
              onSelectPanel ? () => onSelectPanel("commerce_center") : undefined
            }
          />
        </RoleGate>
      ) : null}

      {activePanel === "commerce_center" && role === "performer" ? (
        <RoleGate
          allow={["PERFORMER", "ARTIST", "ADMIN", "STAFF"]}
          fallback={
            <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              Commerce Center requires a Performer session.
            </div>
          }
        >
          <CreatorCommerceCenterDrawer
            key={`commerce-${contextPerformerId ?? userId}`}
            performerId={contextPerformerId ?? userId}
            displayName={contextDisplayName}
            accentColor="#FFD700"
            onOpenYoPho={onSelectPanel ? () => onSelectPanel("yopho") : undefined}
            onOpenBeatMarketplace={
              onSelectPanel ? () => onSelectPanel("beat_marketplace") : undefined
            }
            onOpenShop={onSelectPanel ? () => onSelectPanel("store") : undefined}
          />
        </RoleGate>
      ) : null}

      {activePanel === "beat_marketplace" ? (
        <div
          key={`beat-mkt-${contextPerformerId ?? userId}`}
          style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Beat Marketplace — browse, preview, and license beats. No fake inventory counts.
            {role === "performer" ? ` · Context: ${contextDisplayName}` : ""}
          </div>
          <Link href="/beat-marketplace" style={toolLink("#FFD700")}>
            Open Beat Marketplace →
          </Link>
          <Link href="/beat-vault" style={toolLink("rgba(255,215,0,0.7)")}>
            Open Beat Vault →
          </Link>
        </div>
      ) : null}

      {activePanel === "media_locker" && role === "performer" ? (
        <div style={{ padding: 12 }} key={`locker-${contextPerformerId ?? userId}`}>
          <MediaLockerCanister
            userId={contextPerformerId ?? userId}
            role="performer"
            accentColor={theme.secondary}
          />
        </div>
      ) : null}

      {activePanel === "beat_lab" && role === "performer" ? (
        <div
          key={`beat-lab-${contextPerformerId ?? userId}`}
          style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Beat Lab & Competition Vault — open the real vault surfaces.
            {` · Context: ${contextDisplayName}`}
          </div>
          <Link href="/beat-vault" style={toolLink(theme.tertiary)}>
            Open Beat Vault →
          </Link>
          <Link href="/performer/studio" style={toolLink(theme.primary)}>
            Performer Studio →
          </Link>
        </div>
      ) : null}

      {activePanel === "booking" && role === "performer" ? (
        <div style={{ padding: 12 }} key={`booking-${contextPerformerId ?? userId}`}>
          <BookingCanister
            entityId={contextPerformerId ?? userId}
            entityType="performer"
            showRequestForm={false}
            accentColor="#00FF88"
          />
        </div>
      ) : null}

      {activePanel === "stage_tools" && role === "performer" ? (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Stage & broadcast tools — curtain control + real destinations.
          </div>
          <PerformerCurtainControlPanel
            performerId={userId}
            sessionId={`hub-curtain-${userId}`}
            accentColor={theme.primary}
            compact
          />
          <button
            type="button"
            onClick={() => {
              void presentInstantGoLiveInPlace({ role: "PERFORMER", preferredExperience: "live" });
            }}
            style={{
              ...toolLink(theme.primary),
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "left",
            }}
          >
            🔴 Go Live
          </button>
          <Link href="/performer/studio" style={toolLink(theme.secondary)}>
            Studio & stage engines →
          </Link>
        </div>
      ) : null}

      {/* Rule 26: sponsor management chrome is not a Performer hub surface */}
      {activePanel === "sponsors" && role === "fan" ? <SponsorsStubFan /> : null}

      {activePanel === "marketplace" && role === "fan" ? (
        <RoleGate allow={["FAN", "ADMIN", "STAFF"]} fallback={null}>
          <MarketplaceDrawerPanel accentColor="#FF6B35" />
        </RoleGate>
      ) : null}

      {activePanel === "store" ? (
        <ShopDrawerPanel
          role={role}
          fallbackPerformerId={role === "performer" ? userId : undefined}
          accentColor={theme.tertiary}
        />
      ) : null}

      {activePanel === "notifications" ? (
        <div style={{ padding: 12 }}>
          <NotificationCanister accentColor={theme.secondary} onClose={onClose} />
        </div>
      ) : null}

      {activePanel === "queue" ? (
        <div style={{ padding: 12 }}>
          <QueueCanister accentColor={theme.primary} />
        </div>
      ) : null}

      {activePanel === "messaging" ? (
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.45 }}>
            Community messaging is always on — start a thread anytime. Threads load from your real inbox.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link href="/friends" style={toolLink(theme.secondary)}>
              Friends →
            </Link>
            <Link href="/messages" style={toolLink("#FFD700")}>
              Full messages page →
            </Link>
          </div>
          <MessagingCanister height={360} />
        </div>
      ) : null}

      {activePanel === "submissions" ? (
        <div style={{ padding: 12 }}>
          <SubmissionsCanister
            role={role}
            userId={userId}
            displayName={displayName}
            accentColor={role === "fan" ? "#FF2DAA" : "#FFD700"}
          />
        </div>
      ) : null}

      {activePanel === "scores" ? (
        <div style={{ padding: 12 }}>
          <ScoresCanister role={role} accentColor="#00D4FF" />
        </div>
      ) : null}

      {/* ── Fan-only: Prize Vault ─────────────────────────────────────────── */}
      {activePanel === "prize_vault" && role === "fan" ? (
        <RoleGate allow={["FAN", "ADMIN", "STAFF"]} fallback={null}>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#FF6B35" }}>
              PRIZE VAULT · CLAIMS & AWARDS
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
              Your prize claims, shipping status, and award history will appear here once the Prize Distribution
              Engine is wired. (Rule 24 — post soft-launch feature.)
            </p>
            <Link href="/fan/prizes" style={toolLink("#FF6B35")}>
              View Prize Center →
            </Link>
            <Link href="/competitions" style={toolLink("rgba(255,107,53,0.6)")}>
              Enter a competition →
            </Link>
          </div>
        </RoleGate>
      ) : null}

      {/* ── Fan-only: Tickets & Orders ────────────────────────────────────── */}
      {activePanel === "tickets" && role === "fan" ? (
        <RoleGate allow={["FAN", "ADMIN", "STAFF"]} fallback={null}>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#00D4FF" }}>
              TICKETS & ORDERS
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
              No tickets or orders yet. Tickets purchased from venues and promoters will appear here.
              Ticket inventory is managed by Venues and Promoters only (Rule 17).
            </p>
            <Link href="/fan/tickets" style={toolLink("#00D4FF")}>
              My Tickets →
            </Link>
            <Link href="/events" style={toolLink("rgba(0,212,255,0.6)")}>
              Browse Events →
            </Link>
          </div>
        </RoleGate>
      ) : null}

      {/* ── Fan-only: Favorites ───────────────────────────────────────────── */}
      {activePanel === "favorites" && role === "fan" ? (
        <RoleGate allow={["FAN", "ADMIN", "STAFF"]} fallback={null}>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#FF2DAA" }}>
              FAVORITES
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
              No favorites saved yet. Tap the heart or bookmark icon on any artist, song, battle, or concert to
              save it here.
            </p>
            <Link href="/fan/favorites" style={toolLink("#FF2DAA")}>
              View All Favorites →
            </Link>
            <Link href="/performers" style={toolLink("rgba(255,45,170,0.6)")}>
              Discover Artists →
            </Link>
          </div>
        </RoleGate>
      ) : null}

      {/* ── Achievement Center (Fan + Performer) ──────────────────────────── */}
      {activePanel === "achievement_center" ? (
        <AchievementCenterDrawer
          userId={userId}
          role={role}
          displayName={role === "performer" ? contextDisplayName : displayName}
          accentColor="#FFD700"
        />
      ) : null}

      {/* ── Championship Center (Fan + Performer) ─────────────────────────── */}
      {activePanel === "championship_center" ? (
        <ChampionshipCenterDrawer
          userId={userId}
          role={role}
          displayName={role === "performer" ? contextDisplayName : displayName}
          accentColor="#FFD700"
        />
      ) : null}

      {/* ── Creator Asset Vault (Performer) ───────────────────────────────── */}
      {activePanel === "asset_vault" && role === "performer" ? (
        <CreatorAssetVaultPanel
          fallbackPerformerId={contextPerformerId ?? userId}
          accentColor="#FF2DAA"
        />
      ) : null}

      {/* ── Shop Center alias → Shop drawer (Personal + TMI) ─────────────── */}
      {activePanel === "shop_center" && role === "performer" ? (
        <ShopDrawerPanel
          role={role}
          fallbackPerformerId={userId}
          accentColor={theme.tertiary}
        />
      ) : null}

      {activePanel === "marketplace" && role === "performer" ? (
        <MarketplaceDrawerPanel accentColor="#00FFFF" />
      ) : null}

      {/* ── High-Fidelity Cyberpunk Drawers (100% Mockup Matched) ─────── */}
      {activePanel === "tmi_store" ? (
        <ShopDrawerPanel
          role={role}
          fallbackPerformerId={role === "performer" ? userId : undefined}
          accentColor="#AA2DFF"
        />
      ) : null}
    </UniversalDrawerBase>
  );
}

function toolLink(color: string): CSSProperties {
  return {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: 10,
    background: `${color}22`,
    border: `1px solid ${color}66`,
    color,
    fontWeight: 800,
    fontSize: 12,
    textDecoration: "none",
    width: "fit-content",
  };
}
