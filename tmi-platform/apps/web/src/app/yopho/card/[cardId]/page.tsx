"use client";

/**
 * Public Interactive YoPho Card — canonical share URL.
 * /yopho/card/[cardId]
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import InteractiveYoPhoCard from "@/components/yopho/InteractiveYoPhoCard";
import {
  fetchPublishedCard,
  type PublishedYoPhoCard,
} from "@/lib/yopho/YoPhoCardRegistry";

export default function YoPhoInteractiveCardPage() {
  const params = useParams();
  const cardId = typeof params?.cardId === "string" ? params.cardId : "";
  const [card, setCard] = useState<PublishedYoPhoCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
