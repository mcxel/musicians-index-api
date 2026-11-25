"use client";

/**
 * CommunityWallBoard — shared masonry poster wall for COMMUNITY GOSSIP + HAPPY DAYS.
 * Continuous vertical growth inside the parent scroll container (no numbered comment pages).
 * Motion level STATIC in V1 — architecture ready for SUBTLE/RICH later.
 */

import React, { useMemo, useRef, useCallback, useEffect, useState } from "react";
import {
  type CommunityWallChannel,
  type CommunityWallNote,
  type CommunityWallNoteColor,
  type CommunityWallNoteShape,
  type CommunityWallMotionLevel,
  NOTE_COLOR_STYLES,
  shapeStyle,
  channelDisplayTitle,
  FORBIDDEN_WALL_LABELS,
} from "@/lib/communityWall/CommunityWallContracts";
import {
  layoutWallNotes,
  appendWallBatch,
  createUserWallNote,
  resolveMotionLevel,
  themeForWall,
  COMMUNITY_WALL_SHAPE_OPTIONS,
  COMMUNITY_WALL_COLOR_OPTIONS,
} from "@/lib/communityWall/CommunityWallEngine";
import {
  requestContentTranslation,
  LANGUAGE_NAMES,
  type ContentTranslationView,
  type SupportedLanguage,
  textDirectionForLanguage,
} from "@/lib/translation/TmiTranslationAuthority";

export type CommunityWallBoardProps = {
  channel: CommunityWallChannel;
  notes: CommunityWallNote[];
  onNotesChange: (notes: CommunityWallNote[]) => void;
  /** Optional progressive loader — called near bottom; must return real next batch or []. */
  loadMore?: () => Promise<CommunityWallNote[]>;
  composerEnabled?: boolean;
  authorLabel?: string;
  reducedMotion?: boolean;
  isMobile?: boolean;
  motionLevel?: CommunityWallMotionLevel;
  /** Viewer preferred language for Translate control (default en). */
  viewerLanguage?: SupportedLanguage;
  /** When true: same people, mixed experiences — Global Together (§9752). */
  togetherMode?: boolean;
  "data-testid"?: string;
};

export default function CommunityWallBoard({
  channel,
  notes,
  onNotesChange,
  loadMore,
  composerEnabled = false,
  authorLabel = "You",
  reducedMotion = false,
  isMobile = false,
  motionLevel,
  viewerLanguage = "en",
  togetherMode = false,
  "data-testid": testId = "community-wall-board",
}: CommunityWallBoardProps) {
  const theme = themeForWall(channel);
  const effectiveMotion = resolveMotionLevel({
    requested: motionLevel ?? theme.defaultMotionLevel,
    reducedMotion,
    isMobile,
  });
  const [draft, setDraft] = useState("");
  const [shape, setShape] = useState<CommunityWallNoteShape>(theme.defaultShape);
  const [color, setColor] = useState<CommunityWallNoteColor>(theme.defaultColor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [translationById, setTranslationById] = useState<Record<string, ContentTranslationView | "loading" | "hidden">>({});
  const sentinelRef = useRef<HTMLDivElement>(null);

  const title = togetherMode ? "GLOBAL COMMUNITY" : channelDisplayTitle(channel);
  // Guard against stale Fan Conversation branding leaking into this surface.
  if ((FORBIDDEN_WALL_LABELS as readonly string[]).includes(title)) {
    throw new Error("FORBIDDEN_WALL_LABEL");
  }

  const laidOut = useMemo(() => layoutWallNotes(notes), [notes]);
  const hasSeed = notes.some((n) => n.dataClass === "SEED" || n.dataClass === "FIXTURE");

  const post = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const body = draft.trim();
      if (!body) return;
      const note = createUserWallNote({
        channel,
        authorLabel,
        body,
        shape,
        color,
        dataClass: "USER_SESSION",
      });
      // Persist first (local list) — never animate fake success before known save.
      onNotesChange([note, ...notes]);
      setDraft("");
    },
    [authorLabel, channel, color, draft, notes, onNotesChange, shape],
  );

  useEffect(() => {
    if (!loadMore || exhausted || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((x) => x.isIntersecting);
        if (!hit || loadingMore) return;
        setLoadingMore(true);
        void loadMore()
          .then((batch) => {
            if (!batch.length) {
              setExhausted(true);
              return;
            }
            onNotesChange(appendWallBatch(notes, batch));
          })
          .finally(() => setLoadingMore(false));
      },
      { root: null, rootMargin: "240px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [exhausted, loadMore, loadingMore, notes, onNotesChange]);

  return (
    <section
      data-testid={testId}
      data-channel={channel}
      data-motion-level={effectiveMotion}
      data-theme={theme.id}
      style={{
        marginTop: 24,
        position: "relative",
        borderRadius: 16,
        overflow: "visible",
        padding: "18px 14px 28px",
        background: theme.atmosphere.background,
        border: `1px solid ${theme.atmosphere.accent}33`,
      }}
    >
      {/* Atmosphere — decorative only; cards sit above */}
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          opacity: theme.atmosphere.cloudOpacity,
          background:
            channel === "HAPPY_DAYS"
              ? "radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(ellipse at 80% 20%, rgba(255,255,200,0.25), transparent 40%)"
              : "radial-gradient(ellipse at 15% 25%, rgba(255,255,255,0.18), transparent 42%), radial-gradient(ellipse at 85% 40%, rgba(180,200,255,0.12), transparent 48%)",
        }}
      />
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: theme.atmosphere.overlayGradient,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: theme.atmosphere.accent,
            marginBottom: 6,
          }}
        >
          {title} ({notes.length})
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginBottom: 12, lineHeight: 1.45 }}>
          {togetherMode
            ? "One shared TMI world — many languages on the same wall. Original words stay; tap Translate to understand."
            : channel === "HAPPY_DAYS"
              ? "Celebration wall for the whole world — same community as Gossip, brighter personality. Scroll forever; no comment pages."
              : "Global bulletin wall — everyone hangs out here together. Keep scrolling; no language silos."}
        </div>

        {hasSeed && (
          <div
            data-testid="community-wall-seed-notice"
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "rgba(255,215,0,0.75)",
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            Sample notes for layout preview · not live community activity
          </div>
        )}

        {composerEnabled && (
          <form
            onSubmit={post}
            data-testid="community-wall-composer"
            style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  channel === "HAPPY_DAYS"
                    ? "Share a happy moment…"
                    : "Pin a note to the community wall…"
                }
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#fff",
                  fontSize: 12,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: theme.atmosphere.accent,
                  color: "#050510",
                  fontSize: 11,
                  fontWeight: 900,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                POST
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>
                SHAPE
              </span>
              {COMMUNITY_WALL_SHAPE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShape(s)}
                  aria-pressed={shape === s}
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: shape === s ? `1px solid ${theme.atmosphere.accent}` : "1px solid rgba(255,255,255,0.2)",
                    background: shape === s ? "rgba(255,255,255,0.12)" : "transparent",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>
                COLOR
              </span>
              {COMMUNITY_WALL_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  title={c}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: color === c ? `2px solid ${theme.atmosphere.accent}` : "1px solid rgba(255,255,255,0.35)",
                    background: NOTE_COLOR_STYLES[c].bg,
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </form>
        )}

        {/* Continuous masonry — grows with notes; no internal capped scroller */}
        <div
          data-testid="community-wall-masonry"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 14,
            alignItems: "start",
          }}
        >
          {laidOut.map((n) => {
            const palette = NOTE_COLOR_STYLES[n.color];
            const span = isMobile ? 1 : n.columnSpan;
            const lang = n.originalLanguage ?? "und";
            const dir = textDirectionForLanguage(
              lang === "und" ? "und" : (lang as SupportedLanguage),
            );
            const tState = translationById[n.id];
            const showingTranslation =
              tState &&
              tState !== "loading" &&
              tState !== "hidden" &&
              tState.status === "READY" &&
              tState.translatedText;
            return (
              <article
                key={n.id}
                data-note-id={n.id}
                data-data-class={n.dataClass}
                data-shape={n.shape}
                data-original-language={lang}
                style={{
                  gridColumn: span === 2 ? "span 2" : "span 1",
                  maxWidth: "100%",
                  padding: "14px 16px",
                  background: palette.bg,
                  color: palette.ink,
                  border: `1px solid ${palette.border}`,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.28)",
                  minHeight: n.shape === "SQUARE" ? 160 : undefined,
                  ...shapeStyle(n.shape),
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: palette.nameInk, fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    {n.authorLabel}
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(0,0,0,0.45)", flexShrink: 0 }}>{n.relativeTimeLabel}</span>
                </div>
                {lang !== "und" && lang in LANGUAGE_NAMES && (
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", color: "rgba(0,0,0,0.4)", marginBottom: 6 }}>
                    {(LANGUAGE_NAMES as Record<string, string>)[lang] ?? lang}
                  </div>
                )}
                {/* Original always canonical / visible */}
                <p
                  dir={dir}
                  lang={lang === "und" ? undefined : lang}
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.55,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    color: palette.ink,
                  }}
                >
                  {n.body}
                </p>
                {showingTranslation ? (
                  <div
                    data-testid={`translation-view-${n.id}`}
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: "1px dashed rgba(0,0,0,0.15)",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(0,0,0,0.4)", marginBottom: 4 }}>
                      TRANSLATION · {LANGUAGE_NAMES[(tState as ContentTranslationView).targetLanguage]}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        lineHeight: 1.5,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        color: palette.ink,
                        opacity: 0.92,
                      }}
                    >
                      {(tState as ContentTranslationView).translatedText}
                    </p>
                  </div>
                ) : null}
                {tState && tState !== "loading" && tState !== "hidden" && tState.status === "FAILED" && (
                  <div style={{ marginTop: 8, fontSize: 9, color: "rgba(120,40,0,0.75)" }}>
                    Translation unavailable — original kept. Retry anytime.
                  </div>
                )}
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    data-testid={`translate-${n.id}`}
                    disabled={tState === "loading"}
                    onClick={() => {
                      if (showingTranslation) {
                        setTranslationById((prev) => ({ ...prev, [n.id]: "hidden" }));
                        return;
                      }
                      setTranslationById((prev) => ({ ...prev, [n.id]: "loading" }));
                      void requestContentTranslation({
                        contentId: n.id,
                        contentVersion: n.contentVersion ?? 1,
                        originalText: n.body,
                        targetLanguage: viewerLanguage,
                        sourceLanguage: (n.originalLanguage as SupportedLanguage | "und" | undefined) ?? "und",
                        surface: n.channel,
                        fieldKind: "BODY",
                      }).then((view) => {
                        setTranslationById((prev) => ({ ...prev, [n.id]: view }));
                      });
                    }}
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(0,0,0,0.2)",
                      background: "rgba(255,255,255,0.55)",
                      color: palette.nameInk,
                      cursor: "pointer",
                    }}
                  >
                    {tState === "loading"
                      ? "TRANSLATING…"
                      : showingTranslation
                        ? "SHOW ORIGINAL ONLY"
                        : `TRANSLATE → ${LANGUAGE_NAMES[viewerLanguage].toUpperCase()}`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {loadMore && !exhausted && <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />}
        {loadingMore && (
          <div style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
            Loading more notes…
          </div>
        )}
      </div>
    </section>
  );
}
