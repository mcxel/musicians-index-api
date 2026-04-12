"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BeltCard from "@/components/cards/BeltCard";
import GlowFrame from "@/components/home/shared/GlowFrame";
import SectionTitle from "@/components/ui/SectionTitle";
import { getHomeCharts, type HomeChartRow } from "@/components/home/data/getHomeCharts";
import { getHomePlaylists, type HomePlaylistItem } from "@/components/home/data/getHomePlaylists";

type BeltCardAccent = "cyan" | "pink" | "purple" | "gold";

interface StoreItem {
  id: string;
  name: string;
  price: number;
  type: string;
  accent: BeltCardAccent;
}

const STORE_STUBS: StoreItem[] = [
  { id: "1", name: "Crown Season Hoodie", price: 5499, type: "Merch", accent: "pink" },
  { id: "2", name: "TMI Logo Snapback", price: 2999, type: "Merch", accent: "cyan" },
  { id: "3", name: "Avatar Crown Bundle", price: 999, type: "Digital", accent: "gold" },
];

export default function StoreBelt() {
  const [chartLeaders, setChartLeaders] = useState<HomeChartRow[]>([]);
  const [playlists, setPlaylists] = useState<HomePlaylistItem[]>([]);
  const [chartSource, setChartSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    Promise.all([getHomeCharts(3), getHomePlaylists(3)])
      .then(([chartResult, playlistRows]) => {
        setChartLeaders(chartResult.data);
        setChartSource(chartResult.source);
        setPlaylists(playlistRows);
      })
      .catch(() => {});
  }, []);

  return (
    <GlowFrame accent="gold">
      <div style={{ padding: "22px 24px" }}>
        <SectionTitle title="Store Belt" subtitle="Featured drops, merch cues, and playlist-driven discovery." accent="gold" badge={`Featured · ${chartSource === "live" ? "Live" : "Fallback"}`} />
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(260px, 0.85fr)", gap: 16 }}>
          <div style={{ display: "grid", gap: 10 }}>
            {STORE_STUBS.map((item) => (
              <BeltCard
                key={item.id}
                title={item.name}
                badge={item.type}
                stats={`$${(item.price / 100).toFixed(2)}`}
                accent={item.accent}
                glow
              />
            ))}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "14px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
                Chart Leaders
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {chartLeaders.slice(0, 3).map((artist) => (
                  <div key={artist.rank} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{artist.artist}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.46)" }}>{artist.genre}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 800 }}>#{artist.rank}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "14px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
                Playlist Picks
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {playlists.slice(0, 3).map((playlist) => (
                  <div key={playlist.id}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{playlist.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.46)" }}>{playlist.curator} · {playlist.genre}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          <Link href="/store" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FFD700", textDecoration: "none" }}>
            Browse Store →
          </Link>
        </div>
      </div>
    </GlowFrame>
  );
}