"use client";

/**
 * Public Interactive YoPho Card — canonical share URL.
 * /yopho/card/[cardId]
 *
 * Collectible editions: fans collect by editionId; later publishes do not remove prior collections.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import InteractiveYoPhoCard from "@/components/yopho/InteractiveYoPhoCard";
import {
  fetchPublishedCard,
  type PublishedYoPhoCard,
} from "@/lib/yopho/YoPhoCardRegistry";
import {
  collectYoPhoEdition,
  fanOwnsEdition,
  getEditionById,
} from "@/lib/yopho/YoPhoEditionEngine";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";

export default function YoPhoInteractiveCardPage() {
  const params = useParams();
  const cardId = typeof params?.cardId === "string" ? params.cardId : "";
  const [card, setCard] = useState<PublishedYoPhoCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fanUserId, setFanUserId] = useState<string | null>(null);
  const [collectMsg, setCollectMsg] = useState<string | null>(null);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { user?: { id?: string } };
        if (!cancelled && data.user?.id) setFanUserId(data.user.id);
      } catch {
        /* anonymous viewer */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cardId) {
      setLoading(false);
      setError("Missing card id");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const found = await fetchPublishedCard(cardId);
      if (cancelled) return;
      if (!found) {
        setError(
          "This YoPho card was not found. It may only exist on the creator’s device, or the link expired.",
        );
        setCard(null);
      } else {
        setCard(found);
        setError(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  useEffect(() => {
    if (fanUserId && cardId) {
      setOwned(fanOwnsEdition(fanUserId, cardId));
    }
  }, [fanUserId, cardId, collectMsg]);

  function handleCollect() {
    if (!fanUserId) {
      setCollectMsg("Sign in as a Fan to collect this edition.");
      return;
    }
    const edition = getEditionById(cardId);
    const res = collectYoPhoEdition(fanUserId, cardId, {
      creatorOwnerKey: card?.ownerKey,
    });
    if (res.ok) {
      livingOsCommandBus.executeAction("ACTION_COLLECT_YOPHO", {
        role: "fan",
        userId: fanUserId,
        payload: { editionId: cardId },
      });
      setOwned(true);
      setCollectMsg(
        edition
          ? `Collected edition #${edition.editionNumber} — yours forever.`
          : "Collected — yours forever. Later publishes won’t remove this.",
      );
    } else {
      setCollectMsg(res.error ?? "Could not collect");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, #1a0a28 0%, #050510 55%)",
        padding: "24px 16px 48px",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#00E5FF" }}>
              TMI · YOPHO CARD
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>Who I Am Right Now</div>
          </div>
          <Link href="/home/1" style={{ fontSize: 11, color: "#FFD700", fontWeight: 700, textDecoration: "none" }}>
            TMI →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            Loading interactive card…
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              padding: 24,
              borderRadius: 12,
              border: "1px solid rgba(255,45,170,0.35)",
              background: "rgba(255,45,170,0.08)",
              fontSize: 13,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {error}
            <div style={{ marginTop: 14 }}>
              <Link href="/hub/fan" style={{ color: "#00E5FF", fontWeight: 800 }}>
                Open Fan HQ to create your YoPho card →
              </Link>
            </div>
          </div>
        ) : null}

        {card ? (
          <>
            <InteractiveYoPhoCard card={card} />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              {owned ? (
                <div style={{ fontSize: 12, fontWeight: 800, color: "#00FF88" }}>
                  In your collection · later publishes won’t remove this
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCollect}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,45,170,0.55)",
                    background: "rgba(255,45,170,0.14)",
                    color: "#FF2DAA",
                    fontWeight: 900,
                    fontSize: 12,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  COLLECT THIS EDITION
                </button>
              )}
              {collectMsg ? (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", textAlign: "center" }}>
                  {collectMsg}
                </div>
              ) : null}
              {!fanUserId ? (
                <Link href="/login" style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>
                  Sign in to collect →
                </Link>
              ) : null}
            </div>
            <p
              style={{
                marginTop: 20,
                textAlign: "center",
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.5,
              }}
            >
              This is an <strong style={{ color: "#00E5FF" }}>interactive</strong> YoPho living card — not a flat video.
              Scene document + motion loop · pause reacts · song · protected TMI × YoPho footer.
            </p>
          </>
        ) : null}
      </div>
    </main>
  );
}
