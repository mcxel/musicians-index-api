"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { markProfileSeen, moveProfileTrail, readProfileTrail, readSeenProfiles, resolveNextPublicProfile, saveProfileTrail, type ProfileTrail } from "@/lib/profile/profileDiscoveryHistory";

export default function ProfileDiscoveryNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = searchParams?.get("profileId") ?? "";
  const enabled = searchParams?.get("tmiProfiles") === "1" && Boolean(profileId) &&
    (pathname?.startsWith("/p/") || pathname?.startsWith("/profile/"));
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [trail, setTrail] = useState<ProfileTrail | null>(null);
  const [busy, setBusy] = useState(false);
  const [caughtUp, setCaughtUp] = useState(false);
  const startTouch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data: { authenticated?: boolean; user?: { id?: string } }) => {
        if (cancelled || !data.authenticated || !data.user?.id) return;
        setViewerId(data.user.id);
        const saved = readProfileTrail(data.user.id);
        if (!saved) {
          const fresh = { ids: [profileId], index: 0 };
          saveProfileTrail(data.user.id, fresh);
          setTrail(fresh);
        } else if (saved.ids.includes(profileId)) {
          setTrail({ ...saved, index: saved.ids.indexOf(profileId) });
        } else {
          const extended = { ids: [...saved.ids, profileId], index: saved.ids.length };
          saveProfileTrail(data.user.id, extended);
          setTrail(extended);
        }
      }).catch(() => {});
    return () => { cancelled = true; };
  }, [enabled, profileId]);

  useEffect(() => {
    if (!enabled || !viewerId) return;
    const restored = sessionStorage.getItem(`tmi:profile-discovery:scroll:${viewerId}:${profileId}`);
    if (restored) window.scrollTo(0, Number(restored) || 0);
    let remaining = 3000;
    let started = document.visibilityState === "visible" ? Date.now() : 0;
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && started) {
        remaining -= Date.now() - started;
        started = 0;
      } else if (document.visibilityState === "visible" && !started) started = Date.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => {
      if (started && remaining - (Date.now() - started) <= 0) {
        markProfileSeen(viewerId, profileId);
        window.clearInterval(timer);
      }
    }, 200);
    return () => { document.removeEventListener("visibilitychange", onVisibility); window.clearInterval(timer); };
  }, [enabled, profileId, viewerId]);

  const navigate = async (direction: "previous" | "next") => {
    if (!viewerId || busy) return;
    const current = trail ?? readProfileTrail(viewerId);
    if (!current) return;
    setBusy(true);
    try {
      let target = moveProfileTrail(current, direction);
      if (!target && direction === "next") {
        const candidate = await resolveNextPublicProfile(readSeenProfiles(viewerId), current.ids);
        if (candidate) target = moveProfileTrail(current, "next", candidate);
        else setCaughtUp(true);
      }
      if (!target) return;
      sessionStorage.setItem(`tmi:profile-discovery:scroll:${viewerId}:${profileId}`, String(window.scrollY));
      saveProfileTrail(viewerId, target);
      setTrail(target);
      setCaughtUp(false);
      router.push(`/p/${encodeURIComponent(target.ids[target.index]!)}?tmiProfiles=1&profileId=${encodeURIComponent(target.ids[target.index]!)}`);
    } catch {
      setCaughtUp(false);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || ["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement)?.tagName)) return;
      if (event.key === "ArrowLeft") void navigate("previous");
      if (event.key === "ArrowRight") void navigate("next");
    };
    const onStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("button, a, input, textarea, video, audio, [data-no-profile-swipe]")) return;
      startTouch.current = { x: event.touches[0]!.clientX, y: event.touches[0]!.clientY };
    };
    const onEnd = (event: TouchEvent) => {
      if (!startTouch.current || !event.changedTouches.length) return;
      const dx = event.changedTouches[0]!.clientX - startTouch.current.x;
      const dy = event.changedTouches[0]!.clientY - startTouch.current.y;
      startTouch.current = null;
      if (Math.abs(dx) >= 90 && Math.abs(dx) > Math.abs(dy) * 2) void navigate(dx < 0 ? "next" : "previous");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  });

  if (!enabled || !viewerId) return null;
  return (
    <nav aria-label="Discover public profiles" style={{ position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 100, display: "flex", alignItems: "center", gap: 8, padding: 8, background: "#091221", border: "1px solid #325475", borderRadius: 6, color: "#fff", boxShadow: "0 8px 24px #000a" }}>
      <button type="button" disabled={busy || (trail?.index ?? 0) === 0} onClick={() => void navigate("previous")} style={{ minHeight: 40, padding: "0 12px" }}>Previous</button>
      <span aria-live="polite" style={{ fontSize: 11, whiteSpace: "nowrap" }}>{caughtUp ? "You're caught up" : busy ? "Finding profile..." : "Public profiles"}</span>
      <button type="button" disabled={busy || caughtUp} onClick={() => void navigate("next")} style={{ minHeight: 40, padding: "0 12px" }}>Next</button>
      <a href="/magazine/issue/current?discover=unseen" data-testid="discovery-open-magazine" style={{ color: "#00FFFF", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", minHeight: 40, display: "inline-flex", alignItems: "center" }}>OPEN MAGAZINE</a>
    </nav>
  );
}