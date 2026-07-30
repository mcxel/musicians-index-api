"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface MagazineArticle {
  id: string;
  pageNumber: number;
  title: string;
  category: "PERFORMER_SPOTLIGHT" | "NEWS_ARTICLE" | "CULTURE_EDITORIAL" | "FAN_SPOTLIGHT" | "SPONSOR_AD";
  author: string;
  performerId?: string;
  performerName?: string;
  themeStyle: "90s_VIBE" | "CLASSIC_EBONY" | "VINTAGE_JET" | "MODERN_CYBER";
  readTimeSec: number;
  contentSnippet: string;
  discoveryPoints: number;
}

const MAGAZINE_PAGES: MagazineArticle[] = [
  {
    id: "mag-p1",
    pageNumber: 1,
    title: "The Rise of New West Coast Hip-Hop & Battle Cyphers",
    category: "PERFORMER_SPOTLIGHT",
    author: "Marcel Monday",
    performerId: "perf-jaypaul",
    performerName: "JayPaul",
    themeStyle: "90s_VIBE",
    readTimeSec: 45,
    contentSnippet: "Exploring the raw energy of live 3D cyphers and the evolution of competitive rap showcases on TMI...",
    discoveryPoints: 20,
  },
  {
    id: "mag-p2",
    pageNumber: 2,
    title: "Inside the World Dance Party 3D Engine",
    category: "CULTURE_EDITORIAL",
    author: "TMI Tech Team",
    themeStyle: "MODERN_CYBER",
    readTimeSec: 30,
    contentSnippet: "How procedural avatar DNA and beat-reactive lighting transform virtual dance arenas into high-energy social venues...",
    discoveryPoints: 15,
  },
  {
    id: "mag-p3",
    pageNumber: 3,
    title: "Weekly Industry Breakdown: Monetizing Display Frames",
    category: "NEWS_ARTICLE",
    author: "Elena Rostova",
    themeStyle: "CLASSIC_EBONY",
    readTimeSec: 60,
    contentSnippet: "Why presence frame bezels and illuminated tally lights are turning digital memories into monetizable collectibles...",
    discoveryPoints: 10,
  },
  {
    id: "mag-p4",
    pageNumber: 4,
    title: "Fan Spotlight: Top 10 Audience Energy Champions",
    category: "FAN_SPOTLIGHT",
    author: "Community Desk",
    themeStyle: "VINTAGE_JET",
    readTimeSec: 25,
    contentSnippet: "Highlighting the fans who drove the highest crowd hype and cheer intensity during the championship finals...",
    discoveryPoints: 15,
  },
];

export interface MagazineExperienceRuntimeProps {
  onClose?: () => void;
}

export default function MagazineExperienceRuntime({ onClose }: MagazineExperienceRuntimeProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [userPoints, setUserPoints] = useState(120);
  const [discoveryJournal, setDiscoveryJournal] = useState<{ artists: string[]; stories: string[] }>({
    artists: ["JayPaul"],
    stories: ["West Coast Hip-Hop"],
  });
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [artistPanelOpen, setArtistPanelOpen] = useState(false);
  const [hasClaimedPoints, setHasClaimedPoints] = useState<Record<string, boolean>>({});

  const currentPage = MAGAZINE_PAGES[currentPageIndex] || MAGAZINE_PAGES[0];

  // Save progress automatically to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tmi-mag-last-page", String(currentPageIndex));
    }
  }, [currentPageIndex]);

  // Anti-abuse discovery point reward logic
  const claimPointsForCurrentPage = () => {
    if (hasClaimedPoints[currentPage.id]) return;

    setUserPoints((p) => p + currentPage.discoveryPoints);
    setHasClaimedPoints((prev) => ({ ...prev, [currentPage.id]: true }));

    if (currentPage.performerName && !discoveryJournal.artists.includes(currentPage.performerName)) {
      setDiscoveryJournal((prev) => ({
        ...prev,
        artists: [...prev.artists, currentPage.performerName!],
      }));
    }
  };

  const nextPage = () => {
    if (currentPageIndex < MAGAZINE_PAGES.length - 1) {
      setCurrentPageIndex((i) => i + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((i) => i - 1);
    }
  };

  return (
    <div className="relative w-full h-[620px] bg-slate-950 text-white rounded-2xl overflow-hidden border border-amber-500/40 flex flex-col justify-between p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
      {/* Magazine HUD Header */}
      <div className="flex items-center justify-between z-20 bg-black/80 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <h2 className="text-sm font-black tracking-widest text-amber-400">TMI MAGAZINE EXPERIENCE</h2>
            <p className="text-[10px] text-white/50">PAGE {currentPage.pageNumber} OF {MAGAZINE_PAGES.length} · RESUME ACTIVE</p>
          </div>
        </div>

        {/* User Discovery Points HUD */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300">
            <span>⭐ DISCOVERY XP:</span>
            <span className="text-white font-mono text-sm">{userPoints} PTS</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-xs font-bold text-white/50 hover:text-white">
              ✕ CLOSE
            </button>
          )}
        </div>
      </div>

      {/* Main Magazine Reader Viewport */}
      <div className="relative flex-1 my-4 bg-slate-900 rounded-xl border border-amber-500/20 overflow-hidden flex flex-col justify-between p-8">
        {/* Style Identity Coating */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <span className="text-[10px] font-black text-amber-400 tracking-widest">
            {currentPage.category.replace("_", " ")}
          </span>
          <span className="text-[10px] font-mono text-white/40">STYLE: {currentPage.themeStyle}</span>
        </div>

        {/* Article Body */}
        <div className="my-6">
          <h1 className="text-2xl font-black text-white tracking-tight mb-3">
            {currentPage.title}
          </h1>
          <p className="text-sm text-white/80 leading-relaxed font-sans max-w-2xl">
            {currentPage.contentSnippet}
          </p>
          {currentPage.performerName && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs font-bold text-cyan-400">SPOTLIGHT: {currentPage.performerName}</span>
              <button
                onClick={() => setArtistPanelOpen(true)}
                className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/30 transition"
              >
                👤 VIEW YOPHO PROFILE
              </button>
            </div>
          )}
        </div>

        {/* Interactive Reading Controls & Points Claim */}
        <div className="flex items-center justify-between border-t border-amber-500/20 pt-4 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAudioPlaying(!audioPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                audioPlaying ? "bg-emerald-500/30 text-emerald-300 border-emerald-400" : "bg-white/5 text-white/70 border-white/10"
              }`}
            >
              {audioPlaying ? "🎙 READ ALOUD (PLAYING)" : "🎙 LISTEN READ ALOUD"}
            </button>
            <button
              onClick={claimPointsForCurrentPage}
              disabled={hasClaimedPoints[currentPage.id]}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                hasClaimedPoints[currentPage.id]
                  ? "bg-white/5 text-white/30 border-white/10"
                  : "bg-amber-500/20 text-amber-300 border-amber-400 hover:bg-amber-500/30"
              }`}
            >
              {hasClaimedPoints[currentPage.id] ? "CLAIMED ✓" : `CLAIM +${currentPage.discoveryPoints} PTS`}
            </button>
          </div>

          {/* Page Turn Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className="px-4 py-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-xs font-bold disabled:opacity-30"
            >
              ← PREV PAGE
            </button>
            <button
              onClick={nextPage}
              disabled={currentPageIndex === MAGAZINE_PAGES.length - 1}
              className="px-4 py-2 bg-amber-500 text-black font-extrabold rounded-lg text-xs hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-30"
            >
              NEXT PAGE →
            </button>
          </div>
        </div>
      </div>

      {/* Contextual In-Magazine Artist YoPho Overlay */}
      <AnimatePresence>
        {artistPanelOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-x-8 top-16 bottom-20 z-40 bg-slate-950/95 backdrop-blur-2xl border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <h3 className="text-sm font-black text-cyan-400 tracking-widest">
                IN-MAGAZINE YOPHO PROFILE :: {currentPage.performerName}
              </h3>
              <button onClick={() => setArtistPanelOpen(false)} className="text-xs font-bold text-white/50 hover:text-white">
                ✕ CLOSE
              </button>
            </div>
            <div className="my-4 flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl">
                🎧
              </div>
              <h4 className="text-base font-bold text-white">{currentPage.performerName}</h4>
              <p className="text-xs text-white/60">Top Track: "Cypher King 2026" · 12.4k Plays</p>
              <div className="flex items-center gap-2 mt-2">
                <button className="px-4 py-2 bg-cyan-500 text-black font-bold text-xs rounded-lg">FOLLOW ARTIST</button>
                <button className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg">BUY TICKET</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discovery Journal Footer Indicator */}
      <div className="z-20 bg-black/80 backdrop-blur-md px-6 py-2 rounded-xl border border-white/10 flex items-center justify-between text-[10px] text-white/60">
        <div>JOURNAL: {discoveryJournal.artists.length} ARTISTS DISCOVERED · {discoveryJournal.stories.length} STORIES READ</div>
        <div className="text-amber-400 font-mono">CONTINUOUS REWARDS ENGINE ACTIVE</div>
      </div>
    </div>
  );
}
