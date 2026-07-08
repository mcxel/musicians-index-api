"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getPerformerBySlug } from "@/lib/performers/PerformerRegistry";
import Link from "next/link";

// ── QR image URL — Google Charts API, zero npm dependencies ──────────────────
function qrUrl(data: string, size = 220) {
  return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(data)}&choe=UTF-8&chld=M|1`;
}

// ── Cash-App-style personal Tip QR card ──────────────────────────────────────
function TipQRCard({
  slug,
  name,
  baseUrl,
}: {
  slug: string;
  name: string;
  baseUrl: string;
}) {
  const tipUrl = `${baseUrl}/p/${slug}?action=tip`;
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard?.writeText(tipUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(20,10,40,0.95) 0%, rgba(5,5,16,0.98) 100%)",
        border: "1px solid rgba(255,215,0,0.35)",
        borderRadius: 20,
        padding: 22,
        textAlign: "center",
        boxShadow: "0 0 40px rgba(255,215,0,0.08)",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 11,
          color: "#ffd700",
          textTransform: "uppercase",
          letterSpacing: 3,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Tip QR Code
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#a0a0b0",
          marginBottom: 16,
        }}
      >
        Scan to tip {name} instantly
      </div>

      {/* QR */}
      <div
        style={{
          display: "inline-block",
          background: "#fff",
          padding: 10,
          borderRadius: 14,
          boxShadow: "0 0 24px rgba(255,215,0,0.2)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl(tipUrl, 220)}
          alt={`Tip QR for ${name}`}
          width={220}
          height={220}
          style={{ display: "block", borderRadius: 6 }}
        />
      </div>

      {/* Name beneath QR */}
      <div
        style={{
          marginTop: 14,
          fontSize: 16,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: 1,
        }}
      >
        {name}
      </div>
      <div
        style={{ fontSize: 11, color: "#888", marginTop: 2, marginBottom: 16 }}
      >
        themusiciansindex.com
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={copyLink}
          style={{
            background: "rgba(255,215,0,0.12)",
            border: "1px solid rgba(255,215,0,0.4)",
            color: "#ffd700",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copied ? "✅ Copied!" : "🔗 Copy Tip Link"}
        </button>
        {/* Download via API proxy route */}
        <a
          href={`/api/qr?data=${encodeURIComponent(tipUrl)}&label=${encodeURIComponent(name)}`}
          download={`${slug}-tip-qr.png`}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#ccc",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          ⬇ Save QR
        </a>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 10,
          color: "#555",
          lineHeight: 1.6,
        }}
      >
        Put on stage screens · merch · posters · TikTok · Instagram · business
        cards
      </div>
    </div>
  );
}

// ── Live audience join QR — routes through LobbyEntryFlow → seat assignment ──
function LiveJoinCard({
  slug,
  name,
  roomId,
  liveRoomRoute,
  viewerCount,
  baseUrl,
}: {
  slug: string;
  name: string;
  roomId?: string;
  liveRoomRoute?: string;
  viewerCount: number;
  baseUrl: string;
}) {
  // Route through LobbyEntryFlow: /live/join handles seat assignment per Rule 15
  const joinPath = liveRoomRoute
    ? `${baseUrl}${liveRoomRoute}?autoJoin=true&ref=qr`
    : `${baseUrl}/live/join?room=${roomId ?? slug}&autoJoin=true&ref=qr`;

  const [copied, setCopied] = useState(false);

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(180,0,0,0.18) 0%, rgba(5,5,16,0.98) 100%)",
        border: "2px solid rgba(220,0,0,0.6)",
        borderRadius: 20,
        padding: 22,
        textAlign: "center",
        marginBottom: 16,
        boxShadow: "0 0 40px rgba(220,0,0,0.12)",
        position: "relative",
      }}
    >
      {/* Pulse live badge */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          background: "rgba(220,0,0,0.9)",
          color: "#fff",
          borderRadius: 6,
          padding: "3px 10px",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#fff",
            display: "inline-block",
            animation: "pulse 1.2s infinite",
          }}
        />
        LIVE
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#ff6060",
          textTransform: "uppercase",
          letterSpacing: 3,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        🔴 Join the Show
      </div>
      <div style={{ fontSize: 13, color: "#a0a0b0", marginBottom: 16 }}>
        Scan → get your seat in {name}&apos;s live room
        {viewerCount > 0 && (
          <span style={{ color: "#ff9090", fontWeight: 700 }}>
            {" "}
            · {viewerCount.toLocaleString()} watching
          </span>
        )}
      </div>

      {/* Large QR */}
      <div
        style={{
          display: "inline-block",
          background: "#fff",
          padding: 10,
          borderRadius: 14,
          boxShadow: "0 0 32px rgba(220,0,0,0.3)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl(joinPath, 220)}
          alt={`Join ${name} live`}
          width={220}
          height={220}
          style={{ display: "block", borderRadius: 6 }}
        />
      </div>

      <div
        style={{ marginTop: 14, fontSize: 13, color: "#ff9090", fontWeight: 700 }}
      >
        You&apos;ll be warped directly to your seat
      </div>
      <div style={{ fontSize: 11, color: "#666", marginTop: 4, marginBottom: 16 }}>
        No waiting. The venue opens and your seat is reserved.
      </div>

      <div
        style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}
      >
        <button
          onClick={() => {
            navigator.clipboard?.writeText(joinPath).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            });
          }}
          style={{
            background: "rgba(220,0,0,0.15)",
            border: "1px solid rgba(220,0,0,0.5)",
            color: "#ff9090",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copied ? "✅ Copied!" : "🔗 Copy Join Link"}
        </button>
        <a
          href={`/api/qr?data=${encodeURIComponent(joinPath)}&label=${encodeURIComponent("Join " + name + " Live")}`}
          download={`${slug}-live-qr.png`}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#999",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          ⬇ Save QR
        </a>
      </div>

      <div style={{ marginTop: 12, fontSize: 10, color: "#555", lineHeight: 1.6 }}>
        Show on stage screen · share in live chat · put on venue poster
      </div>
    </div>
  );
}

// ── Tip row — amounts ─────────────────────────────────────────────────────────
const TIP_PRESETS = [5, 10, 20, 50];

function TipRow({ recipientSlug }: { recipientSlug: string }) {
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  function tip(amount: number) {
    const cents = Math.round(amount * 100);
    window.location.href = `/api/stripe/checkout?priceId=price_tip_${cents}&amount=${cents}&productName=${encodeURIComponent("Tip")}&mode=payment&performer=${recipientSlug}`;
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          color: "#a0a0b0",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        Tip Instantly
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap" as const,
          marginBottom: 8,
        }}
      >
        {TIP_PRESETS.map((a) => (
          <button
            key={a}
            onClick={() => tip(a)}
            style={{
              background: "rgba(255,215,0,0.12)",
              border: "1px solid #ffd700",
              color: "#ffd700",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              minWidth: 60,
            }}
          >
            💸 ${a}
          </button>
        ))}
        <button
          onClick={() => setShowCustom((v) => !v)}
          style={{
            background: "rgba(0,229,255,0.1)",
            border: "1px solid #00e5ff",
            color: "#00e5ff",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Custom
        </button>
      </div>
      {showCustom && (
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input
            type="number"
            min={1}
            placeholder="$Amount"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(0,229,255,0.4)",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 14,
              width: 110,
            }}
          />
          <button
            onClick={() => {
              const n = parseFloat(custom);
              if (n >= 1) tip(n);
            }}
            style={{
              background: "rgba(0,229,255,0.18)",
              border: "1px solid #00e5ff",
              color: "#00e5ff",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tabbed QR panel (all QR types) ───────────────────────────────────────────
function AllQRPanel({
  slug,
  name,
  baseUrl,
  isLive,
  liveRoomRoute,
  roomId,
}: {
  slug: string;
  name: string;
  baseUrl: string;
  isLive: boolean;
  liveRoomRoute?: string;
  roomId?: string;
}) {
  const joinPath = liveRoomRoute
    ? `${baseUrl}${liveRoomRoute}?autoJoin=true&ref=qr`
    : `${baseUrl}/live/join?room=${roomId ?? slug}&autoJoin=true&ref=qr`;

  const tabs = [
    { label: "Profile", url: `${baseUrl}/p/${slug}`, emoji: "🎤" },
    { label: "Tip", url: `${baseUrl}/p/${slug}?action=tip`, emoji: "💰" },
    { label: "Book", url: `${baseUrl}/p/${slug}?action=book`, emoji: "📅" },
    { label: "Music", url: `${baseUrl}/p/${slug}?action=music`, emoji: "🎵" },
    ...(isLive
      ? [{ label: "Join Live", url: joinPath, emoji: "🔴" }]
      : []),
  ];
  const [active, setActive] = useState(0);

  return (
    <div
      style={{
        background: "rgba(10,6,20,0.9)",
        border: "1px solid rgba(0,229,255,0.25)",
        borderRadius: 16,
        padding: 20,
        marginTop: 8,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#a0a0b0",
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        All QR Codes
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap" as const,
        }}
      >
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            style={{
              background:
                i === active
                  ? "rgba(0,229,255,0.2)"
                  : "rgba(255,255,255,0.05)",
              border: `1px solid ${i === active ? "#00e5ff" : "rgba(255,255,255,0.1)"}`,
              color: i === active ? "#00e5ff" : "#888",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{ background: "#fff", padding: 8, borderRadius: 10 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl(tabs[active].url, 180)}
            alt={`QR code for ${tabs[active].label}`}
            width={180}
            height={180}
            style={{ display: "block" }}
          />
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#666",
            textAlign: "center",
            maxWidth: 240,
            wordBreak: "break-all" as const,
          }}
        >
          {tabs[active].url}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => navigator.clipboard?.writeText(tabs[active].url)}
            style={{
              background: "rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.3)",
              color: "#00e5ff",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Copy Link
          </button>
          <a
            href={`/api/qr?data=${encodeURIComponent(tabs[active].url)}&label=${encodeURIComponent(name + " — " + tabs[active].label)}`}
            download={`${slug}-${tabs[active].label.toLowerCase().replace(/\s+/g, "-")}-qr.png`}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#999",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 11,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ⬇ Save
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CreatorLinkPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug ?? "";
  const action = searchParams?.get("action") ?? "";

  const performer = getPerformerBySlug(slug);
  const [liveStatus, setLiveStatus] = useState<{
    isLive: boolean;
    viewers: number;
  } | null>(null);
  const [showAllQR, setShowAllQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://themusiciansindex.com";

  // Scroll-to-action on mount
  const tipRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const musicRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (action === "tip" && tipRef.current)
      tipRef.current.scrollIntoView({ behavior: "smooth" });
    if (action === "book" && bookRef.current)
      bookRef.current.scrollIntoView({ behavior: "smooth" });
    if (action === "music" && musicRef.current)
      musicRef.current.scrollIntoView({ behavior: "smooth" });
    if (action === "join" && joinRef.current)
      joinRef.current.scrollIntoView({ behavior: "smooth" });
  }, [action]);

  // Poll live status from homepage/live endpoint
  useEffect(() => {
    async function checkLive() {
      try {
        const res = await fetch("/api/homepage/live");
        if (!res.ok) return;
        const data = (await res.json()) as {
          live?: Array<{ roomId: string; viewerCount?: number }>;
        };
        const match = data.live?.find((s) => s.roomId?.includes(slug));
        setLiveStatus({
          isLive: !!match,
          viewers: match?.viewerCount ?? 0,
        });
      } catch {
        /* silent — live status is optional */
      }
    }
    checkLive();
    const iv = setInterval(checkLive, 15_000);
    return () => clearInterval(iv);
  }, [slug]);

  // Combine registry live status with polled status
  const isLive = liveStatus?.isLive ?? performer?.isLive ?? false;
  const viewers =
    liveStatus?.viewers ?? performer?.audienceCount ?? 0;

  function copyProfileUrl() {
    const url = `${baseUrl}/p/${slug}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (!performer) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#050510",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column" as const,
          color: "#fff",
          fontFamily: "monospace",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 32 }}>🎤</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Creator not found</div>
        <div style={{ color: "#888", fontSize: 13 }}>{slug}</div>
        <Link
          href="/performers"
          style={{ color: "#00e5ff", textDecoration: "none", fontSize: 13 }}
        >
          Browse performers →
        </Link>
      </div>
    );
  }

  const shareText = `🎤 I'm live everywhere tonight!\n💰 Tip me instantly — no account needed\n🎟 Book me for your event\n🎵 Hear my music\n👇 ${baseUrl}/p/${slug}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        maxWidth: 460,
        margin: "0 auto",
        paddingBottom: 48,
      }}
    >
      {/* Hero image */}
      <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={performer.profileImageUrl || "/images/tmi-placeholder.jpg"}
          alt={performer.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(5,5,16,0) 40%, #050510 100%)",
          }}
        />
        {isLive && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(220,0,0,0.9)",
              color: "#fff",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#fff",
                display: "inline-block",
                animation: "pulse 1.2s infinite",
              }}
            />
            LIVE{viewers > 0 && ` · ${viewers.toLocaleString()} watching`}
          </div>
        )}
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Identity */}
        <div style={{ marginTop: -30, position: "relative", zIndex: 1 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: -0.5,
            }}
          >
            {performer.name}
          </h1>
          <div style={{ color: "#a0a0b0", fontSize: 13, marginTop: 4 }}>
            {performer.category} · {performer.city}, {performer.flag}
            {performer.rank <= 50 && (
              <span style={{ marginLeft: 8, color: "#ffd700", fontWeight: 700 }}>
                #{performer.rank} Ranked
              </span>
            )}
          </div>
          {performer.bio && (
            <p
              style={{
                color: "#c0c0d0",
                fontSize: 13,
                lineHeight: 1.6,
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              {performer.bio}
            </p>
          )}
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            margin: "18px 0",
          }}
        />

        {/* 🔴 LIVE — Join QR (only when live) */}
        {isLive && (
          <div ref={joinRef}>
            <LiveJoinCard
              slug={slug}
              name={performer.name}
              roomId={performer.roomId}
              liveRoomRoute={performer.liveRoomRoute}
              viewerCount={viewers}
              baseUrl={baseUrl}
            />
          </div>
        )}

        {/* Personal Tip QR — always visible, Cash App style */}
        <div ref={tipRef} style={{ marginBottom: 16 }}>
          <TipQRCard slug={slug} name={performer.name} baseUrl={baseUrl} />
        </div>

        {/* Tip amount buttons */}
        <div style={{ marginBottom: 4 }}>
          <TipRow recipientSlug={slug} />
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            margin: "18px 0",
          }}
        />

        {/* Share row */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap" as const,
          }}
        >
          <button
            onClick={copyProfileUrl}
            style={{
              background: "rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.4)",
              color: "#00e5ff",
              borderRadius: 10,
              padding: "9px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {copied ? "✅ Copied!" : "🔗 Share Profile Link"}
          </button>
          <button
            onClick={() => setShowAllQR((v) => !v)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#aaa",
              borderRadius: 10,
              padding: "9px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {showAllQR ? "Hide QR List" : "📱 All QR Codes"}
          </button>
          <button
            onClick={() =>
              navigator.share?.({
                title: performer.name,
                text: shareText,
                url: `${baseUrl}/p/${slug}`,
              })
            }
            style={{
              background: "rgba(200,50,255,0.1)",
              border: "1px solid rgba(200,50,255,0.4)",
              color: "#cc33ff",
              borderRadius: 10,
              padding: "9px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ↑ Tell Fans
          </button>
        </div>

        {/* Collapsible all-QR panel */}
        {showAllQR && (
          <AllQRPanel
            slug={slug}
            name={performer.name}
            baseUrl={baseUrl}
            isLive={isLive}
            liveRoomRoute={performer.liveRoomRoute}
            roomId={performer.roomId}
          />
        )}

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            margin: "18px 0",
          }}
        />

        {/* Book */}
        <div ref={bookRef} style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              color: "#a0a0b0",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Book This Performer
          </div>
          <Link
            href={`/booking/request?performer=${slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.3)",
              color: "#00e5ff",
              borderRadius: 12,
              padding: "14px 18px",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            <span>📅 Request a Performance</span>
            <span>→</span>
          </Link>
          <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>
            Concert · Festival · Club · Wedding · Private Event · Corporate ·
            Podcast
          </div>
        </div>

        {/* Music preview */}
        {performer.songs && performer.songs.length > 0 && (
          <div ref={musicRef} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: "#a0a0b0",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Latest Music
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 6,
              }}
            >
              {performer.songs.slice(0, 3).map((song, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#e0e0f0" }}>
                    🎵 {song.title}
                  </span>
                  {song.audioUrl && (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <audio
                      controls
                      src={song.audioUrl}
                      style={{ height: 28, width: 120 }}
                    />
                  )}
                </div>
              ))}
            </div>
            <Link
              href={`/profile/performer/${slug}`}
              style={{
                fontSize: 11,
                color: "#00e5ff",
                textDecoration: "none",
                display: "block",
                marginTop: 8,
              }}
            >
              Full profile + playlist →
            </Link>
          </div>
        )}

        {/* Merch */}
        {performer.merch && performer.merch.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: "#a0a0b0",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Merch
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto" as const,
                paddingBottom: 4,
              }}
            >
              {performer.merch.slice(0, 4).map((item, i) => (
                <a
                  key={i}
                  href={item.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    textDecoration: "none",
                    color: "#e0e0f0",
                    minWidth: 120,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  🛍 {item.name}
                  <br />
                  <span style={{ color: "#ffd700", fontWeight: 700 }}>
                    ${item.price}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            margin: "18px 0",
          }}
        />

        {/* "Support Me" card — paste into TikTok/YouTube/IG */}
        <div
          style={{
            background: "rgba(10,6,20,0.8)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#a0a0b0",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Paste Into Your Live Chat
          </div>
          <pre
            style={{
              margin: 0,
              fontSize: 12,
              color: "#e0e0f0",
              whiteSpace: "pre-wrap" as const,
              fontFamily: "monospace",
              lineHeight: 1.7,
            }}
          >
            {shareText}
          </pre>
          <button
            onClick={() => navigator.clipboard?.writeText(shareText)}
            style={{
              marginTop: 10,
              background: "rgba(255,215,0,0.12)",
              border: "1px solid rgba(255,215,0,0.4)",
              color: "#ffd700",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Copy Message
          </button>
        </div>

        {/* TMI branding footer */}
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>
              Powered by
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: "#00e5ff",
                letterSpacing: 2,
              }}
            >
              THE MUSICIANS INDEX
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
