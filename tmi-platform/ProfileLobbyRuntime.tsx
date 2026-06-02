"use client";

import React from "react";
import StickyStage from "@/components/stage/StickyStage";
import AvatarLobbyCanvas from "@/components/lobbies/AvatarLobbyCanvas";
import Link from "next/link";

export type ProfileRole = "fan" | "artist" | "performer" | "venue" | "sponsor" | "promoter";

interface ProfileLobbyRuntimeProps {
  role: ProfileRole;
  displayName: string;
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
 * Replaces legacy fragmented pages. Same engine, different data.
 */
export default function ProfileLobbyRuntime({
  role,
  displayName,
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
    promoter: "#FF9500"
  };

  const accentColor = accentMap[role] || "#fff";

  return (
    <main className="min-h-screen bg-[#050510] text-white pb-20 font-sans">
      {/* Layer 1: Pinned Video/Stage */}
      <StickyStage isLive={isLive} activePerformer={displayName} accentColor={accentColor}>
        {videoSrc && (
          <video src={videoSrc} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        )}
      </StickyStage>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Layer 2: Identity & Stats */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase px-2 py-1 rounded-full bg-white/10" style={{ color: accentColor }}>
                    {role}
                  </span>
                  <h1 className="text-3xl font-black mt-3 tracking-wide">{displayName}</h1>
                  <p className="text-sm text-white/60 mt-2 max-w-xl leading-relaxed">{bio}</p>
                </div>
              </div>
            </section>

            {/* Layer 3: Interactive Canvas */}
            <section>
              <AvatarLobbyCanvas roomName={`${displayName}'s Lobby`} is3DReady={false} />
            </section>
          </div>

          {/* Right Rail: Revenue & Actions */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-64">
              <h3 className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase mb-4">Support & Action</h3>
              <button className="w-full py-3 rounded-lg font-black text-xs tracking-widest text-black transition-transform hover:scale-[1.02]" style={{ background: accentColor }}>
                SUPPORT {displayName.toUpperCase()}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}