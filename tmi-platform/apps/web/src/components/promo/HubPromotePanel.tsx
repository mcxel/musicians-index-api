"use client";

/**
 * Hub Promote Panel — fast doorway on the Cast Controls strip.
 * Uses UniversalPromotionRackAuthority. Does not present on open or on ADD.
 * Platform house promos come from HouseSponsorCanon. Personal catalogs stay empty
 * until a real inventory authority supplies them.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HOUSE_SPONSORS, type HouseSponsor } from "@/lib/commerce/HouseSponsorCanon";
import {
  PROMO_ANCHOR_PRESETS,
  classifyPromoMedia,
  commandPromoTransport,
  defaultPlacement,
  readPlacementPreset,
  writePlacementPreset,
  type PromoPlacementPreset,
} from "@/lib/promo/promotePresentationController";
import {
  closePromoDeck,
  getLivePresentation,
  getPrivateOperatorView,
  hideLivePromo,
  listRackItems,
  markPromoReady,
  mergePromoLibrary,
  openPromoDeck,
  removePromoFromReady,
  takePromoLive,
  type UniversalPromoItem,
} from "@/lib/promo/UniversalPromotionRackAuthority";

type CategoryId = "sponsors" | "albums" | "songs" | "playlists" | "artwork" | "products" | "ready";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "sponsors", label: "SPONSORS" },
  { id: "albums", label: "ALBUMS" },
  { id: "songs", label: "SONGS" },
  { id: "playlists", label: "PLAYLISTS" },
  { id: "artwork", label: "ARTWORK" },
  { id: "products", label: "PRODUCTS" },
  { id: "ready", label: "READY" },
];

function houseItems(creatorId: string): UniversalPromoItem[] {
  return HOUSE_SPONSORS.map((sponsor, index) => ({
    promoItemId: `house:${sponsor.id}`,
    sourceType: "CREATOR_PRODUCT" as const,
    sourceAuthority: "HouseSponsorCanon",
    canonicalTargetId: sponsor.id,
    creatorId,
    title: sponsor.name,
    subtitle: sponsor.tagline,
    artworkAssetId: null,
    badge: "PLATFORM",
    callToAction: "SHOW",
    exactDestination: sponsor.href ?? "/home/1",
    qrDestination: sponsor.href ?? "/home/1",
    availability: "AVAILABLE" as const,
    rightsState: "APPROVED" as const,
    disclosure: "NONE" as const,
    priceLabel: null,
    scarcityLabel: null,
    sortRank: index,
    campaignId: null,
  }));
}

function inCategory(item: UniversalPromoItem, category: CategoryId, readyIds: Set<string>): boolean {
  if (category === "ready") return readyIds.has(item.promoItemId) || item.availability === "READY" || item.availability === "LIVE";
  if (category === "sponsors") return item.sourceAuthority === "HouseSponsorCanon" || item.sourceType === "SPONSOR_CAMPAIGN";
  if (category === "albums") return item.sourceType === "YO_ALBUM" || item.sourceType === "YOALBUM_SECURE" || item.sourceType === "YO_EP";
  if (category === "songs") return item.sourceType === "YO_SINGLE";
  if (category === "playlists") return item.sourceType === "STREAM";
  if (category === "artwork") return item.sourceType === "FILM_PROJECT" && item.badge === "ARTWORK";
  if (category === "products") return item.sourceType === "MERCH" || item.sourceType === "CREATOR_PRODUCT" && item.sourceAuthority !== "HouseSponsorCanon";
  return false;
}

const EMPTY_COPY: Record<CategoryId, string> = {
  sponsors: "No sponsor creative is authorized for this account.",
  albums: "No albums in your catalog.",
  songs: "No songs in your catalog.",
  playlists: "No playlists in your catalog.",
  artwork: "No artwork in your catalog.",
  products: "No products in your catalog.",
  ready: "Nothing is ready. Add an eligible item first. Adding does not put it on screen.",
};

type Props = {
  sessionId: string;
  creatorId: string;
  role: "fan" | "performer";
  onClose: () => void;
  onPresentHouse: (sponsor: HouseSponsor, placement: PromoPlacementPreset) => void;
  onPlaceSponsor: (placement: PromoPlacementPreset) => void;
  onHideSponsor: () => void;
  onClearSponsor: () => void;
  visual: (PromoPlacementPreset & { sponsor: HouseSponsor; hidden: boolean }) | null;
  onShareLink?: () => void;
};

export default function HubPromotePanel({
  sessionId,
  creatorId,
  role,
  onClose,
  onPresentHouse,
  onPlaceSponsor,
  onHideSponsor,
  onClearSponsor,
  visual,
  onShareLink,
}: Props) {
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const savedScroll = useRef(0);
  const [tick, setTick] = useState(0);
  const [category, setCategory] = useState<CategoryId>("sponsors");
  const [detailId, setDetailId] = useState<string | null>(null);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    openPromoDeck(sessionId, creatorId);
    mergePromoLibrary({ sessionId, creatorId, items: houseItems(creatorId) });
    refresh();
    return () => {
      closePromoDeck(sessionId);
    };
  }, [sessionId, creatorId, refresh]);

  const view = useMemo(() => getPrivateOperatorView(sessionId), [sessionId, tick]);
  const items = view.inventory.length ? view.inventory : listRackItems(sessionId);
  const readyIds = useMemo(() => new Set(view.queue), [view.queue]);
  const visible = items.filter((item) => inCategory(item, category, readyIds));
  const detail = detailId ? items.find((item) => item.promoItemId === detailId) ?? null : null;
  const live = getLivePresentation(sessionId);

  const addReady = (id: string) => {
    markPromoReady(sessionId, id);
    refresh();
  };

  const present = (id: string) => {
    const item = listRackItems(sessionId).find((entry) => entry.promoItemId === id);
    if (item?.sourceAuthority === "HouseSponsorCanon") {
      const sponsor = HOUSE_SPONSORS.find((entry) => entry.id === item.canonicalTargetId);
      if (sponsor) {
        const placement = readPlacementPreset(creatorId, id) ?? defaultPlacement();
        onPresentHouse(sponsor, placement);
      }
    }
    takePromoLive({ sessionId, creatorId, promoItemId: id });
    refresh();
  };

  const hide = () => {
    hideLivePromo(sessionId);
    onHideSponsor();
    refresh();
  };

  const openDetail = (id: string) => {
    savedScroll.current = scrollerRef.current?.scrollTop ?? 0;
    setDetailId(id);
  };

  const back = () => {
    setDetailId(null);
    requestAnimationFrame(() => {
      if (scrollerRef.current) scrollerRef.current.scrollTop = savedScroll.current;
    });
  };

  return (
    <motion.section
      data-testid="hub-promote-panel"
      data-promote-role={role}
      data-promote-category={category}
      role="dialog"
      aria-label="Promote"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: 8 }}
      transition={reduce ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
      style={{
        width: "min(420px, calc(100vw - 16px))",
        maxHeight: "min(70vh, 640px)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        background: "linear-gradient(165deg,#120a28 0%,#080612 55%,#0a1420 100%)",
        border: "1px solid rgba(0,229,255,0.45)",
        borderRadius: 12,
        boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
        color: "#e8f7ff",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#00E5FF" }}>PROMOTE</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>
            {live ? "On screen" : "Add, then tap to show"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {onShareLink ? (
            <button
              type="button"
              data-testid="hub-promote-share-link"
              title="Share your public page link or copy it"
              onClick={onShareLink}
              style={chipBtn}
            >
              🔗 SHARE LINK
            </button>
          ) : null}
          {live ? (
            <button type="button" data-testid="hub-promote-hide" onClick={hide} style={chipBtn}>
              HIDE
            </button>
          ) : null}
          <button type="button" data-testid="hub-promote-close" aria-label="Close Promote" onClick={onClose} style={chipBtn}>
            CLOSE
          </button>
        </div>
      </div>

      <div
        data-testid="hub-promote-categories"
        style={{ display: "flex", gap: 6, overflowX: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-x", paddingBottom: 2 }}
      >
        {CATEGORIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            data-testid={`hub-promote-cat-${entry.id}`}
            aria-pressed={category === entry.id}
            onClick={() => {
              setCategory(entry.id);
              setDetailId(null);
            }}
            style={{
              ...chipBtn,
              flexShrink: 0,
              borderColor: category === entry.id ? "#00E5FF" : "rgba(255,255,255,0.16)",
              color: category === entry.id ? "#00E5FF" : "rgba(255,255,255,0.75)",
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {detail ? (
        <div data-testid="hub-promote-detail" style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
          <button type="button" data-testid="hub-promote-back" onClick={back} style={{ ...chipBtn, alignSelf: "flex-start" }}>
            BACK
          </button>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#FFD700" }}>{detail.badge}</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{detail.title}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{detail.subtitle}</div>
          <AssetController
            item={detail}
            creatorId={creatorId}
            visual={visual}
            onAdd={() => addReady(detail.promoItemId)}
            onShow={() => present(detail.promoItemId)}
            onHide={hide}
            onClear={() => {
              onClearSponsor();
              refresh();
            }}
            onPlace={(placement) => {
              writePlacementPreset(creatorId, detail.promoItemId, placement);
              if (visual && !visual.hidden && visual.sponsor.id === detail.canonicalTargetId) onPlaceSponsor(placement);
            }}
          />
        </div>
      ) : (
        <div
          ref={scrollerRef}
          data-testid="hub-promote-scroller"
          style={{ overflowY: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-y", display: "flex", flexDirection: "column", gap: 6, minHeight: 120, paddingRight: 2 }}
        >
          {visible.length === 0 ? (
            <div data-testid="hub-promote-empty" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", padding: 8 }}>
              {EMPTY_COPY[category]}
            </div>
          ) : (
            visible.map((item) => (
              <div
                key={item.promoItemId}
                data-testid={`hub-promote-item-${item.promoItemId}`}
                data-promo-state={item.availability}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: item.availability === "LIVE" ? "1px solid #00FF88" : "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <button
                  type="button"
                  onClick={() => openDetail(item.promoItemId)}
                  style={{ flex: 1, textAlign: "left", background: "transparent", border: 0, color: "inherit", cursor: "pointer", fontFamily: "inherit", minHeight: 44 }}
                >
                  <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: "#FF2DAA" }}>{item.badge}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{item.subtitle}</div>
                </button>
                <button type="button" data-testid={`hub-promote-add-${item.promoItemId}`} onClick={() => addReady(item.promoItemId)} style={actionBtn}>
                  ADD
                </button>
                {(item.availability === "READY" || item.availability === "LIVE" || readyIds.has(item.promoItemId)) ? (
                  <button type="button" data-testid={`hub-promote-tap-${item.promoItemId}`} onClick={() => present(item.promoItemId)} style={actionBtn}>
                    TAP
                  </button>
                ) : null}
                {category === "ready" ? (
                  <button type="button" data-testid={`hub-promote-remove-${item.promoItemId}`} onClick={() => { removePromoFromReady(sessionId, item.promoItemId); refresh(); }} style={chipBtn}>
                    REMOVE
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}
    </motion.section>
  );
}

const chipBtn: React.CSSProperties = {
  minHeight: 36,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.04)",
  color: "#e8f7ff",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.06em",
  cursor: "pointer",
  fontFamily: "inherit",
};

const actionBtn: React.CSSProperties = {
  ...chipBtn,
  border: "1px solid rgba(0,229,255,0.55)",
  color: "#00E5FF",
};

function AssetController({
  item,
  creatorId,
  visual,
  onAdd,
  onShow,
  onHide,
  onClear,
  onPlace,
}: {
  item: UniversalPromoItem;
  creatorId: string;
  visual: (PromoPlacementPreset & { sponsor: HouseSponsor; hidden: boolean }) | null;
  onAdd: () => void;
  onShow: () => void;
  onHide: () => void;
  onClear: () => void;
  onPlace: (placement: PromoPlacementPreset) => void;
}) {
  const kind = classifyPromoMedia(item);
  const saved = readPlacementPreset(creatorId, item.promoItemId) ?? defaultPlacement();
  const current: PromoPlacementPreset =
    visual && visual.sponsor.id === item.canonicalTargetId
      ? { anchor: visual.anchor, size: visual.size, target: visual.target }
      : saved;
  const visualKind = kind === "SPONSOR" || kind === "ARTWORK";
  const transport = commandPromoTransport({ action: "PLAY", audioUrl: null, hasQueue: false });

  if (!visualKind) {
    return (
      <div data-testid="hub-promote-transport" data-promo-transport={transport.code} style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
        <div style={{ marginBottom: 8 }}>{kind} has no playable source on this account. Playback controls stay off.</div>
        <div>Shuffle, repeat, visualizer, and video seek are not connected.</div>
      </div>
    );
  }

  return (
    <div data-testid="hub-promote-controller" data-promo-kind={kind} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)" }}>
        {visual && visual.sponsor.id === item.canonicalTargetId && !visual.hidden ? "ON SCREEN" : visual?.hidden ? "HIDDEN" : "READY"}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" data-testid="hub-promote-add" onClick={onAdd} style={actionBtn}>ADD</button>
        <button type="button" data-testid="hub-promote-show" onClick={onShow} style={actionBtn}>SHOW</button>
        <button type="button" data-testid="hub-promote-hide-visual" onClick={onHide} style={chipBtn}>HIDE</button>
        <button type="button" data-testid="hub-promote-clear" onClick={onClear} style={chipBtn}>CLEAR</button>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {(["M1", "M2"] as const).map((target) => (
          <button
            key={target}
            type="button"
            data-testid={`hub-promote-target-${target}`}
            onClick={() => onPlace({ ...current, target })}
            style={actionBtn}
          >
            {target}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {PROMO_ANCHOR_PRESETS.map((anchor) => (
          <button
            key={anchor}
            type="button"
            data-testid={`hub-promote-anchor-${anchor}`}
            onClick={() => onPlace({ ...current, anchor })}
            style={chipBtn}
          >
            {anchor.replace("_", " ")}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {(["COMPACT", "FIT", "FILL"] as const).map((size) => (
          <button key={size} type="button" data-testid={`hub-promote-size-${size}`} onClick={() => onPlace({ ...current, size })} style={chipBtn}>
            {size}
          </button>
        ))}
      </div>
      <div data-testid="hub-promote-missing" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
        Freeform drag and rotation interval are not connected. Position uses the monitor anchor presets.
      </div>
    </div>
  );
}
