"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import VenueInteractionRailClient from "@/components/venues/VenueInteractionRailClient";
import RouteRecoveryCard from "@/components/routing/RouteRecoveryCard";
import SlugFallbackPanel from "@/components/routing/SlugFallbackPanel";
import SocketStatusBadge from "@/components/routing/SocketStatusBadge";
import ReconnectButton from "@/components/routing/ReconnectButton";
import ReturnPathButton from "@/components/routing/ReturnPathButton";
import { registerRoute } from "@/lib/routing/RouteClosureRegistry";
import { registerReturnPath } from "@/lib/routing/ReturnPathResolver";
import { resolveSlug } from "@/lib/routing/SlugRecoveryEngine";
import SocketRecoveryEngine from "@/lib/routing/SocketRecoveryEngine";

type StageState = {
  venueSlug: string;
  active: boolean;
  currentPerformer: { name: string; genre: string; micHot: boolean } | null;
  queue: { id: string; name: string }[];
  rotationCount: number;
  hostMicHot: boolean;
};

type AudienceSnapshot = {
  present: number;
  capacity: number;
  occupancyPct: number;
  peakPresent: number;
};

type CrowdMeter = {
  appLausePower: number;
  booMeter: number;
  hypeLevel: number;
};

export default function VenueLivePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [stage, setStage] = useState<StageState | null>(null);
  const [audience, setAudience] = useState<AudienceSnapshot | null>(null);
  const [meter, setMeter] = useState<CrowdMeter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registerRoute("/venues/[slug]/live", "open", {
      returnRoute: "/live/lobby",
      fallbackRoute: "/venues",
      nextAction: "watch-live",
    });
    registerReturnPath({
      fromRoute: "/venues/[slug]/live",
      toRoute: "/live/lobby",
      label: "Back to Lobby",
    });
    resolveSlug("venue", slug || "unknown-venue");
    SocketRecoveryEngine.register("guest-user", `sock_venue_${slug}`, slug);

    async function load() {
      setLoading(true);
      const [stageRes, audienceRes, reactionRes] = await Promise.allSettled([
        fetch(`/api/live/stage?venue=${slug}`).then((r) => r.json()),
        fetch(`/api/live/audience?venue=${slug}`).then((r) => r.json()),
        fetch(`/api/live/reactions?venue=${slug}`).then((r) => r.json()),
      ]);
      if (stageRes.status === "fulfilled") setStage(stageRes.value as StageState);
      if (audienceRes.status === "fulfilled") setAudience(audienceRes.value as AudienceSnapshot);
      if (reactionRes.status === "fulfilled") setMeter((reactionRes.value as { meter: CrowdMeter }).meter);
      setLoading(false);
    }
    load();
  }, [slug]);

  async function activateStage() {
    await fetch("/api/live/stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate", venueSlug: slug }),
    });
    const res = await fetch(`/api/live/stage?venue=${slug}`);
    setStage(await res.json());
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <Link href={`/venues/${slug}`} style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Venue"}</Link>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>Live Hub</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: stage?.active ? "#00FF88" : "#555", display: "inline-block", boxShadow: stage?.active ? "0 0 10px #00FF88" : "none" }} />
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, margin: 0 }}>{slug} — Live</h1>
        </div>
        <p style={{ color: "#999", fontSize: 14 }}>Venue live runtime — stage, audience, and crowd energy.</p>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        {loading && <p style={{ color: "#666" }}>Loading live data...</p>}

        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {/* Stage Card */}
            <div style={{ background: "rgba(255,45,170,0.06)", border: `1px solid ${stage?.active ? "#FF2DAA33" : "#33333399"}`, borderRadius: 14, padding: "22px 26px" }}>
              <div style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>STAGE</div>
              {stage?.currentPerformer ? (
                <>
                  <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{stage.currentPerformer.name}</p>
                  <p style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>{stage.currentPerformer.genre} — Mic: {stage.currentPerformer.micHot ? "HOT 🎤" : "OFF"}</p>
                </>
              ) : (
                <p style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>No performer on stage</p>
              )}
              <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>Rotations: {stage?.rotationCount ?? 0}</p>
              {!stage?.active && (
                <button onClick={activateStage}
                  style={{ background: "#FF2DAA", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 800, cursor: "pointer", fontSize: 12 }}>
                  Activate Stage
                </button>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <Link href={`/live/queue`} style={{ color: "#FFD700", fontSize: 12, textDecoration: "none" }}>Manage Queue</Link>
                <Link href={`/live/hosts`} style={{ color: "#FF8C00", fontSize: 12, textDecoration: "none" }}>Host Control</Link>
              </div>
            </div>

            {/* Audience Card */}
            <div style={{ background: "rgba(0,191,255,0.06)", border: "1px solid #00BFFF33", borderRadius: 14, padding: "22px 26px" }}>
              <div style={{ fontSize: 11, color: "#00BFFF", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>AUDIENCE</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#00BFFF", marginBottom: 4 }}>
                {audience?.present ?? 0}
              </div>
              <p style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>of {audience?.capacity?.toLocaleString() ?? "10,000"} capacity</p>
              <div style={{ height: 6, background: "#1a1a2e", borderRadius: 4, marginBottom: 8 }}>
                <div style={{ height: 6, background: "#00BFFF", borderRadius: 4, width: `${audience?.occupancyPct ?? 0}%` }} />
              </div>
              <p style={{ fontSize: 12, color: "#666" }}>Peak: {audience?.peakPresent ?? 0}</p>
              <Link href={`/venues/${slug}/audience`} style={{ color: "#00BFFF", fontSize: 12, textDecoration: "none", display: "block", marginTop: 10 }}>Full Audience View</Link>
            </div>

            {/* Crowd Energy Card */}
            <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid #FFD70033", borderRadius: 14, padding: "22px 26px" }}>
              <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>CROWD ENERGY</div>
              {meter ? (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginBottom: 3 }}>
                      <span>Applause</span><span>{meter.appLausePower}</span>
                    </div>
                    <div style={{ height: 5, background: "#1a1a2e", borderRadius: 3 }}>
                      <div style={{ height: 5, background: "#00FF88", borderRadius: 3, width: `${meter.appLausePower}%` }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginBottom: 3 }}>
                      <span>Hype</span><span>{meter.hypeLevel}</span>
                    </div>
                    <div style={{ height: 5, background: "#1a1a2e", borderRadius: 3 }}>
                      <div style={{ height: 5, background: "#FFD700", borderRadius: 3, width: `${meter.hypeLevel}%` }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginBottom: 3 }}>
                      <span>Boo Meter</span><span>{meter.booMeter}</span>
                    </div>
                    <div style={{ height: 5, background: "#1a1a2e", borderRadius: 3 }}>
                      <div style={{ height: 5, background: "#ff4444", borderRadius: 3, width: `${meter.booMeter}%` }} />
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: "#555", fontSize: 14 }}>No crowd data yet</p>
              )}
              <Link href={`/live/reactions`} style={{ color: "#FFD700", fontSize: 12, textDecoration: "none", display: "block", marginTop: 12 }}>React Now</Link>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <Link href={`/venues/${slug}/queue`} style={{ background: "rgba(255,215,0,0.08)", color: "#FFD700", border: "1px solid #FFD70033", borderRadius: 8, padding: "9px 18px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>Venue Queue</Link>
          <Link href={`/venues/${slug}/host`} style={{ background: "rgba(255,140,0,0.08)", color: "#FF8C00", border: "1px solid #FF8C0033", borderRadius: 8, padding: "9px 18px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>Host Control</Link>
          <Link href={`/venues/${slug}/audience`} style={{ background: "rgba(0,191,255,0.08)", color: "#00BFFF", border: "1px solid #00BFFF33", borderRadius: 8, padding: "9px 18px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>Audience Panel</Link>
          <Link href="/live/backstage" style={{ background: "rgba(170,45,255,0.08)", color: "#AA2DFF", border: "1px solid #AA2DFF33", borderRadius: 8, padding: "9px 18px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>Backstage</Link>
          <Link href="/live/chat" style={{ background: "rgba(255,45,170,0.08)", color: "#FF2DAA", border: "1px solid #FF2DAA33", borderRadius: 8, padding: "9px 18px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>Live Chat</Link>
        </div>

        <VenueInteractionRailClient venueSlug={slug} />
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <SocketStatusBadge userId="guest-user" />
            <ReconnectButton userId="guest-user" />
            <ReturnPathButton />
          </div>
          <RouteRecoveryCard route="/venues/[slug]/live" />
          <SlugFallbackPanel entity="venue" slug={slug || "unknown-venue"} />
        </div>
      </section>
    </main>
  );
}
