"use client";

/**
 * /rooms — Batch 002A canonical discovery surface.
 * Legacy static brochure ROOMS grid removed (LEGACY-ROOMS-01).
 */

import dynamic from "next/dynamic";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import MemoryCaptureButton from "@/components/memory/MemoryCaptureButton";
import RoomsLiveDiscoverySurface from "@/components/rooms/RoomsLiveDiscoverySurface";

const AvatarLobbyCanvas = dynamic(() => import("@/components/3d/AvatarLobbyCanvas"), { ssr: false });

export default function RoomsPage() {
  return (
    <PageShell>
      <HUDFrame>
        <div
          data-testid="rooms-canonical-discovery"
          style={{
            minHeight: "100vh",
            background: "radial-gradient(circle at 50% 0%, #1a0a2e 0%, #050510 60%)",
            color: "#fff",
            padding: "32px 32px 80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 3D world remains visible — no fabricated crowd fill (activeCount=0). */}
          <AvatarLobbyCanvas activeCount={0} />

          <div style={{ position: "relative", zIndex: 10 }}>
            <RoomsLiveDiscoverySurface />
          </div>
        </div>
      </HUDFrame>
      <div style={{ position: "fixed", bottom: 216, right: 16, zIndex: 998 }}>
        <MemoryCaptureButton userId="rooms-lobby-viewer" roomId="rooms-lobby" />
      </div>
      <FooterHUD />
    </PageShell>
  );
}
