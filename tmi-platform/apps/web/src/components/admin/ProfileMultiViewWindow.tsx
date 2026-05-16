"use client";

import { useMemo } from "react";
import Link from "next/link";

type ProfileObservationType = "artist" | "performer" | "fan" | "bot" | "host" | "venue";

type ProfileObservation = {
  profileId: string;
  type: ProfileObservationType;
  name: string;
  route: string;
  liveCamera: string;
  motionPortrait: string;
  status: "live" | "ready" | "offline";
  activity: string[];
};

const OBSERVED_PROFILES: ProfileObservation[] = [
  { profileId: "artist-ray-journey", type: "artist", name: "Ray Journey", route: "/artists/ray-journey", liveCamera: "/tmi-curated/host-main.png", motionPortrait: "/tmi-curated/mag-35.jpg", status: "live", activity: ["Top 10 orbit", "article click spike", "tips live"] },
  { profileId: "performer-nova-cipher", type: "performer", name: "Nova Cipher", route: "/performers/nova-cipher", liveCamera: "/tmi-curated/mag-66.jpg", motionPortrait: "/tmi-curated/mag-58.jpg", status: "live", activity: ["battle queue", "vote surge", "motion portrait hot"] },
  { profileId: "fan-neonlistener", type: "fan", name: "Neon Listener", route: "/fan/neon-listener", liveCamera: "/assets/avatars/default-avatar.jpg", motionPortrait: "/tmi-curated/home1.jpg", status: "ready", activity: ["wallet active", "tickets opened", "fan lounge present"] },
  { profileId: "bot-alpha", type: "bot", name: "Bot Alpha", route: "/admin/bots/observe", liveCamera: "/assets/avatars/default-avatar.jpg", motionPortrait: "/tmi-curated/mag-58.jpg", status: "offline", activity: ["login script", "room join replay", "purchase sim"] },
  { profileId: "host-tiana", type: "host", name: "Tiana Host", route: "/venues/tiana-monday-night-stage-host/host", liveCamera: "/tmi-curated/host-main.png", motionPortrait: "/tmi-curated/host-4.jpg", status: "live", activity: ["host intro", "stage cue", "vip mention"] },
  { profileId: "venue-neon-stage", type: "venue", name: "Neon Stage", route: "/venues/neon-stage", liveCamera: "/tmi-curated/venue-10.jpg", motionPortrait: "/tmi-curated/venue-22.jpg", status: "ready", activity: ["ticket validation", "lobby queue", "crowd build"] },
];

function statusColor(status: ProfileObservation["status"]): string {
  if (status === "live") return "#00FF88";
  if (status === "ready") return "#FFD700";
  return "#FF2DAA";
}

export default function ProfileMultiViewWindow() {
  const profiles = useMemo(() => OBSERVED_PROFILES, []);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 18 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gap: 14 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "#00FFFF", textTransform: "uppercase", fontWeight: 800 }}>Profile Multi-View</div>
          <h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Artists, performers, fans, bots, hosts, and venues in one watch grid</h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.5)" }}>Each tile carries a live camera frame, motion portrait, profile card, and activity feed.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))", gap: 12 }}>
          {profiles.map((profile) => (
            <article key={profile.profileId} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, background: "rgba(0,0,0,0.32)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", minHeight: 180 }}>
                <div style={{ position: "relative", backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.5)), url('${profile.liveCamera}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
                  <div style={{ position: "absolute", top: 10, left: 10, fontSize: 9, fontWeight: 800, color: statusColor(profile.status), background: `${statusColor(profile.status)}18`, border: `1px solid ${statusColor(profile.status)}35`, borderRadius: 999, padding: "3px 8px", textTransform: "uppercase" }}>
                    {profile.status}
                  </div>
                  <div style={{ position: "absolute", bottom: 10, left: 10, fontSize: 11, fontWeight: 700 }}>{profile.name}</div>
                </div>
                <div style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url('${profile.motionPortrait}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
              </div>
              <div style={{ padding: 12, display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{profile.type}</div>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>{profile.name}</div>
                  </div>
                  <Link href={profile.route} style={{ color: "#00FFFF", textDecoration: "none", fontSize: 10, fontWeight: 700 }}>Open profile →</Link>
                </div>
                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>Activity Feed</div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {profile.activity.map((entry) => (
                      <div key={entry} style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 6 }}>
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}