"use client";

import React from "react";
import StickyStage from "@/components/stage/StickyStage";
import AvatarLobbyCanvas from "@/components/lobbies/AvatarLobbyCanvas";
import MemoryWall from "@/components/memory/MemoryWall";
import PerformerMediaLibrary from "@/components/media/PerformerMediaLibrary";
import Link from "next/link";

export type ProfileRole = "fan" | "artist" | "performer" | "venue" | "sponsor" | "promoter" | "writer";

interface ProfileLobbyRuntimeProps {
  role: ProfileRole;
  displayName: string;
  userId?: string;
  bio?: string;
  stats?: {
    followers?: number;
    xp?: number;
  };
  isLive?: boolean;
  videoSrc?: string;
}

/**
 * ProfileLobbyRuntime: The Universal Hub Engine.
 * Supports all roles. Replaces fragmented layouts.
 * Contains the Pinned Video, 3D Canvas, and standardized panels.
 */
export default function ProfileLobbyRuntime({
  role,
  displayName,
  userId,
  bio = "Welcome to my TMI space.",
  stats = { followers: 0, xp: 0 },
  isLive = false,
  videoSrc
}: ProfileLobbyRuntimeProps) {
  
  const accentMap: Record<ProfileRole, string> = {
    fan: "#00FFFF",
    artist: "#FF2DAA",
    performer: "#FFD700",
    venue: "#00FF88",
    sponsor: "#AA2DFF",
    promoter: "#FF9500",
    writer: "#FF6B35"
  };

  const accentColor = accentMap[role] || "#fff";

  return (
    <main className="min-h-screen bg-[#050510] text-white pb-20 font-sans">
      
      {/* Layer 1: Pinned Video/Stage Engine */}
      <StickyStage isLive={isLive} activePerformer={displayName} accentColor={accentColor}>
        {videoSrc && (
          <video src={videoSrc} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        )}
      </StickyStage>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left/Main Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Identity & Stats */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-right">
                <div style={{ fontSize: 24, fontWeight: 900, color: accentColor }}>{stats.followers?.toLocaleString() || 0}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Followers</div>
              </div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase px-2 py-1 rounded-sm bg-black/50 border" style={{ borderColor: accentColor, color: accentColor }}>
                    {role} PROFILE
                  </span>
                  <h1 className="text-3xl font-black mt-4 tracking-wide">{displayName}</h1>
                  <p className="text-sm text-white/70 mt-2 max-w-xl leading-relaxed">{bio}</p>
                </div>
              </div>
            </section>

            {/* Layer 3: Interactive Avatar Canvas */}
            <section>
              <AvatarLobbyCanvas roomName={`${displayName}'s Operational Hub`} is3DReady={false} />
            </section>

            {/* Memory Wall + Media Library */}
            <section className="grid grid-cols-1 gap-6">
              <MemoryWall items={[]} title="MEMORY WALL" />
              {(role === "performer" || role === "artist") && (
                <PerformerMediaLibrary
                  ownerId={userId ?? displayName.toLowerCase().replace(/\s+/g, "-")}
                  ownerName={displayName}
                  accentColor={accentColor}
                  showUpload
                />
              )}
            </section>
          </div>

          {/* Right Rail: Action Dock & Revenue */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-[45vh] shadow-xl">
              <h3 className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase mb-4 border-b border-white/10 pb-2">Support & Action</h3>
              
              <div className="flex flex-col gap-3">
                <Link href="/subscriptions" className="w-full py-3 rounded-lg font-black text-xs tracking-widest text-black transition-transform hover:scale-[1.02] text-center" style={{ background: accentColor }}>
                  SUBSCRIBE / FOLLOW
                </Link>
                <Link href="/tip" className="w-full py-3 rounded-lg font-black text-xs tracking-widest text-white border border-white/20 transition-colors hover:bg-white/10 text-center">
                  SEND TIP 💰
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}