"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import StageLoader from "@/components/eos/StageLoader";
import { EXPLORE_SECTIONS, type ExploreCardDefinition } from "@/registries/eos/ExploreExperienceMap";
import type { EosRole } from "@/core/eos/types";

export interface ExploreDiscoveryClientProps {
  role?: EosRole;
}

export default function ExploreDiscoveryClient({ role = "fan" }: ExploreDiscoveryClientProps) {
  const [activeExperienceId, setActiveExperienceId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<ExploreCardDefinition | null>(null);

  const openExperience = (item: ExploreCardDefinition) => {
    if (item.experienceId) {
      setActiveCard(item);
      setActiveExperienceId(item.experienceId);
    }
  };

  const closeExperience = () => {
    setActiveExperienceId(null);
    setActiveCard(null);
  };

  return (
    <>
      {EXPLORE_SECTIONS.map((section) => (
        <section key={section.label} style={{ maxWidth: 900, margin: "36px auto 0", padding: "0 24px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 16 }}>
            {section.label}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
            {section.items.map((item) => {
              const inner = (
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${item.color}25`,
                    borderRadius: 12,
                    padding: 16,
                    height: "100%",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{item.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{item.desc}</div>
                  {item.experienceId && (
                    <div style={{ fontSize: 8, color: item.color, marginTop: 8, letterSpacing: "0.1em", fontWeight: 800 }}>
                      EOS EXPERIENCE
                    </div>
                  )}
                </div>
              );

              if (item.experienceId) {
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => openExperience(item)}
                    style={{ background: "none", border: "none", padding: 0, textAlign: "left", color: "inherit" }}
                  >
                    {inner}
                  </button>
                );
              }

              return (
                <Link key={item.name} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <AnimatePresence>
        {activeExperienceId && activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(5,5,16,0.88)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
            onClick={closeExperience}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 480 }}
            >
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: activeCard.color, letterSpacing: "0.12em" }}>
                  {activeCard.name.toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={closeExperience}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6,
                    color: "#fff",
                    fontSize: 11,
                    padding: "4px 10px",
                    cursor: "pointer",
                  }}
                >
                  ✕ Close
                </button>
              </div>
              <StageLoader experienceId={activeExperienceId} role={role} previewMode />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
