"use client";

/**
 * Home2MagazineNetworkTV — living magazine television for Home 2.
 * DiscoveryBus (MagazineDiscoveryBus) + MagazineRotationScheduler vertical slice.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MagazineDiscoveryBus } from "@/lib/discovery/MagazineDiscoveryBus";
import {
  advanceMagazineRotation,
  createMagazineRotationState,
  noteMagazineUserInteraction,
  pauseMagazineRotation,
  replaceMagazineRotationQueue,
  resumeMagazineRotation,
  type MagazineRotationState,
} from "@/lib/magazine/MagazineRotationScheduler";
import { publishHome2MagazineNetwork } from "@/lib/magazine/publishHome2MagazineNetwork";
import { resolveMagazineMediaPresentation } from "@/lib/magazine/magazineMediaFallback";
import {
  MAGAZINE_KIND_LABELS,
  type UnifiedMediaRecord,
} from "@/lib/magazine/UnifiedMediaRecord";
import { getVideoBoostStatus } from "@/lib/magazine/videoBoostEligibility";

const DWELL_MS = 9000;
const RESUME_AFTER_INTERACT_MS = 14000;

export default function Home2MagazineNetworkTV() {
  const [rotation, setRotation] = useState<MagazineRotationState>(() =>
    createMagazineRotationState([]),
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boostStatus = getVideoBoostStatus();

  useEffect(() => {
    publishHome2MagazineNetwork();
    const unsub = MagazineDiscoveryBus.subscribe((records) => {
      setRotation((prev) => {
        if (prev.queue.length === 0) {
          return createMagazineRotationState(records);
        }
        return replaceMagazineRotationQueue(prev, records);
      });
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (rotation.paused || rotation.queue.length <= 1) return;
    const id = window.setInterval(() => {
      setRotation((prev) => advanceMagazineRotation(prev, { intervalMs: DWELL_MS }));
    }, DWELL_MS);
    return () => window.clearInterval(id);
  }, [rotation.paused, rotation.queue.length]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !rotation.allowAudio;
    if (rotation.allowAudio) {
      void el.play().catch(() => {
        /* autoplay policy — stay muted visual */
      });
    }
  }, [rotation.current?.id, rotation.allowAudio]);

  const onInteract = () => {
    setRotation((prev) => noteMagazineUserInteraction(prev));
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      setRotation((prev) => resumeMagazineRotation(prev));
    }, RESUME_AFTER_INTERACT_MS);
  };

  const current = rotation.current;
  const presentation = resolveMagazineMediaPresentation(current);
  const upNext = pickUpNext(rotation);

  return (
    <section
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "28px 24px 12px",
      }}
      onPointerDown={onInteract}
      onKeyDown={onInteract}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.35em",
              color: "#00FFFF",
              fontWeight: 800,
            }}
          >
            MAGAZINE NETWORK · LIVING TV
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Editorial · Organic · Boost · Interview · YoPho · Live when live
          </div>
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
          VIDEO BOOST: {boostStatus.status}
          {rotation.paused ? " · PAUSED" : " · ON AIR"}
          {!rotation.allowAudio ? " · MUTED UNTIL TAP" : " · AUDIO UNLOCKED"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
          gap: 12,
        }}
        data-tmi-home2-magazine-tv
      >
        <div
          style={{
            position: "relative",
            minHeight: 280,
            borderRadius: 14,
            overflow: "hidden",
            border: `1px solid ${(current?.accentColor ?? "#00FFFF")}55`,
            background: "linear-gradient(160deg, rgba(8,10,28,0.96), #050510)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id ?? "empty"}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.15 }}
              transition={{ duration: 0.45 }}
              style={{ position: "absolute", inset: 0 }}
            >
              {presentation.surface === "live" ||
              presentation.surface === "video" ||
              presentation.surface === "animated" ? (
                <video
                  ref={videoRef}
                  src={presentation.src ?? undefined}
                  poster={current?.editorialImageUrl ?? undefined}
                  autoPlay
                  loop
                  playsInline
                  muted={!rotation.allowAudio}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : presentation.surface === "editorial_image" && presentation.src ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: `linear-gradient(180deg, rgba(5,5,16,0.15), rgba(5,5,16,0.82)), url('${presentation.src}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 13,
                    padding: 24,
                    textAlign: "center",
                  }}
                >
                  {presentation.honestEmptyMessage ?? "No magazine media available."}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {current && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "16px 18px",
                background: "linear-gradient(transparent, rgba(5,5,16,0.92))",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  color: current.accentColor,
                  marginBottom: 6,
                }}
              >
                {MAGAZINE_KIND_LABELS[current.kind]} · {current.sourceLabel}
              </div>
              <div style={{ fontSize: "clamp(1rem, 2.4vw, 1.45rem)", fontWeight: 800, lineHeight: 1.15 }}>
                {current.title}
              </div>
              {current.subtitle && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 6,
                    maxWidth: 520,
                  }}
                >
                  {current.subtitle.length > 140
                    ? `${current.subtitle.slice(0, 140)}…`
                    : current.subtitle}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <Link
                  href={current.route}
                  onClick={onInteract}
                  style={{
                    textDecoration: "none",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    color: "#050510",
                    background: current.accentColor,
                    padding: "8px 14px",
                    borderRadius: 6,
                  }}
                >
                  OPEN →
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    setRotation((prev) =>
                      prev.paused ? resumeMagazineRotation(prev) : pauseMagazineRotation(prev),
                    )
                  }
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    color: current.accentColor,
                    background: "transparent",
                    border: `1px solid ${current.accentColor}66`,
                    padding: "8px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  {rotation.paused ? "RESUME" : "PAUSE"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.25em",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            NETWORK QUEUE
          </div>
          {rotation.queue.length === 0 ? (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", padding: "12px 0" }}>
              No magazine stories in rotation yet.
            </div>
          ) : (
            rotation.queue.slice(0, 6).map((item) => (
              <QueueCard
                key={item.id}
                item={item}
                active={item.id === current?.id}
                isUpNext={item.id === upNext?.id}
                onSelect={() => {
                  onInteract();
                  setRotation((prev) => ({
                    ...prev,
                    current: item,
                    index: prev.queue.findIndex((q) => q.id === item.id),
                    lastId: item.id,
                    paused: true,
                  }));
                }}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          [data-tmi-home2-magazine-tv] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function pickUpNext(state: MagazineRotationState): UnifiedMediaRecord | null {
  if (state.queue.length < 2 || !state.current) return null;
  const idx = state.queue.findIndex((q) => q.id === state.current!.id);
  return state.queue[(idx + 1) % state.queue.length] ?? null;
}

function QueueCard({
  item,
  active,
  isUpNext,
  onSelect,
}: {
  item: UnifiedMediaRecord;
  active: boolean;
  isUpNext: boolean;
  onSelect: () => void;
}) {
  return (
    <Link
      href={item.route}
      onClick={onSelect}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "grid",
        gridTemplateColumns: "56px 1fr",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 10,
        border: `1px solid ${active ? item.accentColor : `${item.accentColor}28`}`,
        background: active ? `${item.accentColor}14` : "rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          overflow: "hidden",
          background: item.editorialImageUrl
            ? `url('${item.editorialImageUrl}') center/cover`
            : `${item.accentColor}22`,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: item.accentColor,
            marginBottom: 3,
          }}
        >
          {active ? "NOW" : isUpNext ? "UP NEXT" : MAGAZINE_KIND_LABELS[item.kind]}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </div>
      </div>
    </Link>
  );
}
