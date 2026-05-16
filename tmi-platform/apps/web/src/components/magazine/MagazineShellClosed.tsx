"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HomeMagazineShell from "@/components/magazine/HomeMagazineShell";
import PageRuffleTransition from "@/components/magazine/PageRuffleTransition";
import { getMagShellPolicy } from "@/lib/magazine/MagazineShellState";

const HomePageCoverArtifact = dynamic(
  () => import("@/artifacts/homepages/HomePageCover.artifact"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#03020b",
          color: "#334155",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Loading…
      </div>
    ),
  }
);

const OVERLAY_STYLE = `
@keyframes coverGlowInner {
  0%, 100% { box-shadow: inset 0 0 40px rgba(0,255,255,0.07), inset 0 0 80px rgba(255,45,170,0.04); }
  50%       { box-shadow: inset 0 0 70px rgba(0,255,255,0.16), inset 0 0 130px rgba(255,45,170,0.10); }
}
@keyframes pulseBadge {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}
@keyframes crownPulse {
  0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px #FFD700); }
  50%       { opacity: 0.72; filter: drop-shadow(0 0 18px #FFD700) drop-shadow(0 0 36px #FFD70066); }
}
@keyframes shellIdleTilt {
  0%, 100% { transform: rotate(-1deg) translateY(0); }
  50% { transform: rotate(-0.65deg) translateY(-2px); }
}
`;

const policy = getMagShellPolicy("MAG_CLOSED");

interface MagazineShellClosedProps {
  openRequestToken?: number;
  onOpen?: () => void;
}

export default function MagazineShellClosed({
  openRequestToken,
  onOpen,
}: MagazineShellClosedProps) {
  const router = useRouter();
  const [ruffleActive, setRuffleActive] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: OVERLAY_STYLE }} />

      <HomeMagazineShell
        state="closed"
        physicalScale={1.14}
        openRequestToken={openRequestToken}
        onBeforeOpen={() => setRuffleActive(true)}
        onOpen={() => {
          if (onOpen) {
            onOpen();
            return;
          }
          router.push(policy.navigation.open ?? "/home/1-2");
        }}
      >
        {/* Physical shell realism overlays */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 54,
            pointerEvents: "none",
            borderRadius: 18,
            boxShadow: "inset 4px 0 10px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.08)",
            transform: "rotate(-1deg)",
            animation: "shellIdleTilt 6.8s ease-in-out infinite",
            transformOrigin: "50% 50%",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 10,
            zIndex: 56,
            pointerEvents: "none",
            background: "linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,255,255,0.15))",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 2,
            right: -12,
            bottom: 2,
            width: 12,
            zIndex: 53,
            pointerEvents: "none",
            borderRadius: "0 14px 14px 0",
            boxShadow: "4px 0 0 #ddd, 8px 0 0 #ccc, 12px 0 0 #bbb",
          }}
        />

        {/* Inner glow pulse — visible within overflow:hidden frame */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 55,
            pointerEvents: "none",
            borderRadius: 18,
            animation: "coverGlowInner 3.6s ease-in-out infinite",
          }}
        />

        {/* Canon cover artifact */}
        <HomePageCoverArtifact />

        {/* Page ruffle — plays when shell opens */}
        <PageRuffleTransition active={ruffleActive} />
      </HomeMagazineShell>
    </>
  );
}
