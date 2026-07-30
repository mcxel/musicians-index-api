/**
 * Home3MainPreviewLobby — featured live + side mosaic from DiscoveryBus.
 * Replaces emoji face tiles with LobbyDiscoveryCard / InstantJoin (Rule 20).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LobbyDiscoveryCard from "@/components/discovery/LobbyDiscoveryCard";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { filterForHomepageSurface } from "@/lib/discovery/homepageDiscoveryFilters";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import {
  isoCountryToFlag,
  type LiveDiscoveryRecord,
} from "@/lib/discovery/LiveDiscoveryRecord";

const ROTATE_MS = 25000;

export default function Home3MainPreviewLobby({
  title = "MAIN PREVIEW LOBBY",
}: {
  title?: string;
}) {
  const records = useDiscoveryBus();
  const mosaic = filterForHomepageSurface(records, "home3_mosaic");
  const [featIdx, setFeatIdx] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [joinRoom, setJoinRoom] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);
  const [role, setRole] = useState("FAN");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: { role?: string } }) => {
        if (!cancelled && data?.authenticated) {
          setRole((data.user?.role ?? "FAN").toUpperCase());
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (interacting || mosaic.length <= 1) return;
    const id = window.setInterval(() => {
      setFeatIdx((prev) => (prev + 1) % mosaic.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [interacting, mosaic.length]);

  useEffect(() => {
    if (mosaic.length > 0 && featIdx >= mosaic.length) setFeatIdx(0);
  }, [mosaic.length, featIdx]);

  const handleJoin = useCallback(
    (record: LiveDiscoveryRecord) => {
      setInteracting(true);
      setJoinRoom(resolveInstantJoin(record, { role }));
    },
    [role],
  );

  if (mosaic.length === 0) {
    return (
      <div style={{ padding: "0 12px 8px" }}>
        <div
          style={{
            fontSize: 8,
            letterSpacing: "0.3em",
            color: "#00FFFF",
            fontWeight: 800,
            marginBottom: 14,
          }}
        >
          {title}
        </div>
        <div
          style={{
            padding: "40px 20px",
            borderRadius: 14,
            border: "1px solid rgba(0,255,136,0.2)",
            background: "rgba(0,255,136,0.05)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 12 }}>
            Waiting for social lives…
          </div>
          <Link
            href="/live/go"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "#00FF88",
              color: "#050510",
              borderRadius: 6,
              fontSize: 9,
              fontWeight: 900,
              textDecoration: "none",
              letterSpacing: "0.08em",
            }}
          >
            GO LIVE
          </Link>
        </div>
      </div>
    );
  }

  const featured = mosaic[featIdx]!;
  const sideTiles = mosaic.filter((_, i) => i !== featIdx).slice(0, 8);
  const showPreview =
    focusedId === featured.id &&
    featured.previewMode === "low_res" &&
    Boolean(featured.previewUrl);
  const flag = isoCountryToFlag(featured.countryCode);

  return (
    <>
      <div
        style={{ padding: "0 12px 8px" }}
        onPointerDown={() => setInteracting(true)}
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
      >
        <div
          style={{
            fontSize: 8,
            letterSpacing: "0.3em",
            color: "#00FFFF",
            fontWeight: 800,
            marginBottom: 14,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr minmax(180px, 260px)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <motion.div
            key={featured.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            onMouseEnter={() => setFocusedId(featured.id)}
            onMouseLeave={() => setFocusedId(null)}
            style={{
              position: "relative",
              borderRadius: 14,
              overflow: "hidden",
              border: "2px solid rgba(0,255,136,0.45)",
              boxShadow: "0 0 40px rgba(0,255,136,0.2)",
              background: "linear-gradient(135deg, rgba(0,255,136,0.12), #050510)",
              minHeight: 320,
              cursor: "pointer",
            }}
            onClick={() => handleJoin(featured)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleJoin(featured);
              }
            }}
          >
            {showPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.previewUrl!}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : featured.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.posterUrl}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : null}

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 55%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(255,32,32,0.9)",
                borderRadius: 20,
                padding: "4px 10px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "0.12em",
                }}
              >
                LIVE
              </span>
            </div>

            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 14 }}>{flag}</span>
              <span
                style={{
                  background: "rgba(0,0,0,0.7)",
                  borderRadius: 8,
                  padding: "4px 8px",
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#00FF88",
                }}
              >
                👤 {featured.humanViewerCount.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                bottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: 4,
                }}
              >
                {featured.title}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#00FF88",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  marginBottom: 10,
                }}
              >
                {featured.hostName}
              </div>
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 20px",
                  background: "#00FF88",
                  color: "#050510",
                  borderRadius: 6,
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                }}
              >
                ▶ JOIN ROOM
              </span>
            </div>
          </motion.div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 340,
              overflowY: "auto",
            }}
          >
            {sideTiles.length > 0 ? (
              sideTiles.map((r) => (
                <div
                  key={r.id}
                  onMouseEnter={() => setFocusedId(r.id)}
                  onMouseLeave={() => setFocusedId(null)}
                >
                  <LobbyDiscoveryCard
                    record={r}
                    focused={focusedId === r.id}
                    onJoin={handleJoin}
                  />
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 10,
                  padding: 16,
                }}
              >
                Waiting for more broadcasts…
              </div>
            )}
          </div>
        </div>
      </div>

      {joinRoom && (
        <LobbyEntryFlow
          room={joinRoom.room}
          instant={joinRoom.instant}
          onClose={() => setJoinRoom(null)}
        />
      )}
    </>
  );
}
