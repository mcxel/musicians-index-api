"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import AvatarMiniPreview from "@/components/avatar/AvatarMiniPreview";

export const HOME_SCREENS = [
  { n: 1, path: "/home/1", label: "MAGAZINE COVER", short: "Cover", accent: "#FF2DAA" },
  { n: 2, path: "/home/2", label: "MAGAZINE DASHBOARD", short: "Dashboard", accent: "#00FFFF" },
  { n: 3, path: "/home/3", label: "LIVE WORLD", short: "Live", accent: "#FF4444" },
  { n: 4, path: "/home/4", label: "SOCIAL HUB", short: "Social", accent: "#FFD700" },
  { n: 5, path: "/home/5", label: "CONTROL + JULIUS", short: "Control", accent: "#AA2DFF" },
];

function getActiveIdx(pathname: string): number {
  if (pathname === "/") return 0;
  const m = pathname.match(/^\/home\/(\d)/);
  if (m) {
    const n = parseInt(m[1]);
    if (n >= 1 && n <= 5) return n - 1;
  }
  return 0;
}

export default function HomeNavigator() {
  const router = useRouter();
  const pathname = usePathname();
  const activeIdx = getActiveIdx(pathname ?? "/");
  const current = HOME_SCREENS[activeIdx];
  const prev = HOME_SCREENS[(activeIdx - 1 + HOME_SCREENS.length) % HOME_SCREENS.length];
  const next = HOME_SCREENS[(activeIdx + 1) % HOME_SCREENS.length];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && prev) router.push(prev.path);
      if (e.key === "ArrowRight" && next) router.push(next.path);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, router]);

  return (
    <>
    <style>{`
      @media (max-width: 639px) {
        [data-tmi-hnav-pills] { display: none !important; }
        [data-tmi-hnav-dots]  { display: none !important; }
        [data-tmi-hnav-avatar] { display: none !important; }
      }
    `}</style>
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(5,5,12,0.52)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: `1px solid ${current.accent}30`,
      boxShadow: `0 1px 20px ${current.accent}15`,
      padding: "0 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 52,
      userSelect: "none",
    }}>
      {/* Left arrow */}
      <div style={{ width: 140, display: "flex", justifyContent: "flex-start" }}>
        <button
          onClick={() => router.push(prev.path)}
          style={{
            background: "none", border: "none", cursor: "pointer", outline: "none",
            display: "flex", alignItems: "center", gap: 8,
            color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "6px 10px", borderRadius: 6,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = prev.accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        >
          <span style={{ fontSize: 14 }}>◀</span>
        </button>
      </div>

      {/* Center: dots + current label */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.n}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: 9, fontWeight: 900, letterSpacing: "0.2em",
              color: current.accent, textShadow: `0 0 12px ${current.accent}60`,
            }}
          >
            HOME {current.n} · {current.label}
          </motion.div>
        </AnimatePresence>

        <div data-tmi-hnav-pills style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          {HOME_SCREENS.map((s) => {
            const isActive = s.n === current.n;
            return (
              <Link
                key={`tab-${s.n}`}
                href={s.path}
                title={s.label}
                style={{
                  textDecoration: "none",
                  borderRadius: 999,
                  padding: "5px 10px",
                  border: `1px solid ${isActive ? `${s.accent}99` : "rgba(255,255,255,0.16)"}`,
                  background: isActive
                    ? `linear-gradient(90deg, ${s.accent}33, rgba(5,5,12,0.82))`
                    : "rgba(255,255,255,0.03)",
                  color: isActive ? s.accent : "rgba(255,255,255,0.72)",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  boxShadow: isActive ? `0 0 10px ${s.accent}44` : "none",
                }}
              >
                Home {s.n}
              </Link>
            );
          })}
        </div>

        <div data-tmi-hnav-dots style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {HOME_SCREENS.map((s) => (
            <Link key={s.n} href={s.path} title={s.label} style={{ display: "flex", alignItems: "center" }}>
              <motion.div
                animate={{
                  width: s.n === current.n ? 24 : 6,
                  background: s.n === current.n ? s.accent : "rgba(255,255,255,0.2)",
                  boxShadow: s.n === current.n ? `0 0 8px ${s.accent}` : "none",
                }}
                transition={{ duration: 0.3 }}
                style={{ height: 4, borderRadius: 2 }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Join + Plans + next arrow */}
      <div style={{ width: 190, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
        <Link
          href="/pricing"
          style={{
            textDecoration: "none", color: "#FFD700",
            padding: "4px 9px", fontSize: 9, fontWeight: 800,
            letterSpacing: "0.1em", textTransform: "uppercase",
            borderRadius: 999, border: "1px solid rgba(255,215,0,0.35)",
            background: "rgba(255,215,0,0.06)", whiteSpace: "nowrap",
          }}
        >
          Plans from $0
        </Link>
        <Link
          href="/join"
          style={{
            textDecoration: "none", color: "#050510",
            padding: "4px 10px", fontSize: 9, fontWeight: 900,
            letterSpacing: "0.1em", textTransform: "uppercase",
            borderRadius: 999, background: "#00FFFF", whiteSpace: "nowrap",
          }}
        >
          Join Free
        </Link>
        <button
          onClick={() => router.push(next.path)}
          style={{
            background: "none", border: "none", cursor: "pointer", outline: "none",
            display: "flex", alignItems: "center", gap: 4,
            color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "6px 8px", borderRadius: 6,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = next.accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        >
          <span style={{ fontSize: 14 }}>▶</span>
        </button>
      </div>

      {/* Avatar mini chip — hidden on mobile to prevent overlap with Join Free */}
      <div data-tmi-hnav-avatar style={{ position: "absolute", top: "50%", right: 200, transform: "translateY(-50%)" }}>
        <AvatarMiniPreview variant="mini" accentColor={current?.accent ?? "#00FFFF"} />
      </div>
    </div>
    </>
  );
}
