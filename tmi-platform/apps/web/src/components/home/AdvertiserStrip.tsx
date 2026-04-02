"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

type AdSlot = { brand: string; tagline: string; cta: string; metric: string; color: string; isCTA?: boolean };

const AD_SLOTS: AdSlot[] = [
  { brand: "AMPLIFY RECORDS", tagline: "Discover. Sign. Amplify.", cta: "amplifyrecords.com", metric: "12.4K Impressions", color: "#FF2DAA" },
  { brand: "BEATLAB STUDIOS", tagline: "Record, Mix, Master — All In One", cta: "beatlabstudios.com", metric: "8.7K Impressions", color: "#00FFFF" },
  { brand: "VELOCITY AUDIO", tagline: "Distribution That Moves Fast", cta: "velocityaudio.io", metric: "6.2K Impressions", color: "#AA2DFF" },
  { brand: "NOVA MEDIA GROUP", tagline: "Your Brand. Our Audience. Global Reach.", cta: "novamediagroup.com", metric: "15.1K Impressions", color: "#FFD700" },
  { brand: "YOUR BRAND HERE", tagline: "Reach 50,000+ musicians and music professionals", cta: "/advertise", metric: "Start at $99/mo", color: "#2DFFAA", isCTA: true },
];

export default function AdvertiserStrip() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCurrent(i => (i + 1) % AD_SLOTS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slot = AD_SLOTS[current];

  return (
    <div style={{
      background: "linear-gradient(135deg, #080A10 0%, #0A0A18 100%)",
      border: "1px solid rgba(45,255,170,0.15)",
      borderRadius: 12,
      padding: "22px 28px",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <SectionTitle title="Sponsored Content" accent="cyan" />
        <div style={{ display: "flex", gap: 6 }}>
          {AD_SLOTS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 18 : 6, height: 6, borderRadius: 3, background: i === current ? slot.color : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      <div style={{ position: "relative", overflow: "hidden", minHeight: 108 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "flex", alignItems: "center", gap: 28,
              padding: "18px 20px",
              background: slot.isCTA ? `${slot.color}08` : "#0D0D18",
              border: `1px solid ${slot.color}30`,
              borderRadius: 10,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: slot.color, borderRadius: "10px 0 0 10px" }} />
            <div style={{ width: 70, height: 70, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${slot.color}20 0%, ${slot.color}05 100%)`, border: `1px solid ${slot.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              {slot.isCTA ? "+" : "▲"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: slot.color, textTransform: "uppercase", marginBottom: 4, opacity: 0.8 }}>
                {slot.isCTA ? "ADVERTISE WITH US" : "SPONSORED"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: slot.isCTA ? slot.color : "white", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, lineHeight: 1.2 }}>
                {slot.brand}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{slot.tagline}</div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{slot.metric}</span>
                <Link
                  href={slot.isCTA ? "/advertise" : "#"}
                  style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 4, background: slot.isCTA ? slot.color : "transparent", color: slot.isCTA ? "#000" : slot.color, textDecoration: "none", border: slot.isCTA ? "none" : `1px solid ${slot.color}50` }}
                >
                  {slot.isCTA ? "Get Started →" : "Learn More →"}
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
