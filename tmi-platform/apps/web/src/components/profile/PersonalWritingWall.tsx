"use client";

import React, { useState } from "react";
import type { PersonalWritingEntry } from "@/lib/profile/PublicProfileStyleEngine";

interface PersonalWritingWallProps {
  writings?: PersonalWritingEntry[];
  accentColor?: string;
  isOwner?: boolean;
  onUpdateWritings?: (updated: PersonalWritingEntry[]) => void;
}

export default function PersonalWritingWall({
  writings = [],
  accentColor = "#00FFFF",
  isOwner = false,
  onUpdateWritings,
}: PersonalWritingWallProps) {
  const [editingEntry, setEditingEntry] = useState<PersonalWritingEntry | null>(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [activeWritings, setActiveWritings] = useState<PersonalWritingEntry[]>(writings);

  // Filter out private entries for non-owners
  const visibleEntries = isOwner
    ? activeWritings
    : activeWritings.filter((w) => w.visibility === "PUBLIC");

  if (visibleEntries.length === 0 && !isOwner) {
    return null;
  }

  function handleStartEdit(entry: PersonalWritingEntry) {
    setEditingEntry(entry);
    setEditTitle(entry.title);
    setEditText(entry.body);
  }

  function handleSaveEdit() {
    if (!editingEntry) return;
    const updated = activeWritings.map((w) =>
      w.id === editingEntry.id
        ? { ...w, title: editTitle, body: editText, updatedAt: new Date().toISOString() }
        : w
    );
    setActiveWritings(updated);
    onUpdateWritings?.(updated);
    setEditingEntry(null);
  }

  function handleAddNew(type: PersonalWritingEntry["type"]) {
    const defaultTitles: Record<PersonalWritingEntry["type"], string> = {
      THOUGHT_OF_DAY: "THOUGHT OF THE DAY",
      HAPPY_DAY_QUOTE: "HAPPY DAY QUOTE",
      THINGS_THAT_MAKE_ME_HAPPY: "THINGS THAT MAKE ME HAPPY",
      CURRENT_VIBE: "CURRENT VIBE",
      CUSTOM_TEXT: "NOTE",
    };

    const newEntry: PersonalWritingEntry = {
      id: `w-${Date.now()}`,
      type,
      title: defaultTitles[type],
      body: "Type your personal thought or quote here...",
      visibility: "PUBLIC",
      styleVariant: type === "HAPPY_DAY_QUOTE" ? "PULL_QUOTE" : type === "THINGS_THAT_MAKE_ME_HAPPY" ? "NOTE_CARD" : "NEON_SIGN",
    };

    const updated = [...activeWritings, newEntry];
    setActiveWritings(updated);
    onUpdateWritings?.(updated);
    handleStartEdit(newEntry);
  }

  return (
    <section
      data-testid="personal-writing-wall"
      style={{
        margin: "0 0 28px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 3, height: 14, background: accentColor, borderRadius: 2, display: "inline-block" }} />
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: accentColor, textTransform: "uppercase" }}>
            WORDS & PERSONAL EXPRESSIONS
          </span>
        </div>

        {isOwner && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => handleAddNew("THOUGHT_OF_DAY")}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${accentColor}44`,
                color: accentColor,
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              + THOUGHT
            </button>
            <button
              type="button"
              onClick={() => handleAddNew("HAPPY_DAY_QUOTE")}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,215,0,0.4)",
                color: "#FFD700",
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              + HAPPY QUOTE
            </button>
            <button
              type="button"
              onClick={() => handleAddNew("THINGS_THAT_MAKE_ME_HAPPY")}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,45,170,0.4)",
                color: "#FF2DAA",
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              + WHAT MAKES ME HAPPY
            </button>
          </div>
        )}
      </div>

      {/* Grid of personal writing cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {visibleEntries.map((item) => {
          const isNeon = item.styleVariant === "NEON_SIGN";
          const isPullQuote = item.styleVariant === "PULL_QUOTE";
          const isNoteCard = item.styleVariant === "NOTE_CARD";

          let cardBg = "linear-gradient(135deg, rgba(16, 10, 30, 0.9), rgba(5, 5, 16, 0.95))";
          let cardBorder = `1px solid rgba(255,255,255,0.1)`;
          let cardGlow = "none";
          let titleColor = accentColor;

          if (isNeon) {
            cardBorder = `1.5px solid ${accentColor}77`;
            cardGlow = `0 0 20px ${accentColor}22`;
          } else if (isPullQuote) {
            cardBg = "linear-gradient(135deg, rgba(35, 15, 45, 0.9), rgba(15, 6, 25, 0.95))";
            cardBorder = "1.5px solid rgba(255, 215, 0, 0.4)";
            cardGlow = "0 0 20px rgba(255,215,0,0.15)";
            titleColor = "#FFD700";
          } else if (isNoteCard) {
            cardBg = "linear-gradient(135deg, rgba(20, 30, 40, 0.9), rgba(6, 12, 20, 0.95))";
            cardBorder = "1.5px solid rgba(255, 45, 170, 0.4)";
            cardGlow = "0 0 20px rgba(255,45,170,0.15)";
            titleColor = "#FF2DAA";
          }

          return (
            <div
              key={item.id}
              data-testid={`personal-writing-card-${item.type.toLowerCase()}`}
              style={{
                borderRadius: 14,
                padding: "20px 22px",
                background: cardBg,
                border: cardBorder,
                boxShadow: cardGlow,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 140,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: "0.18em",
                      color: titleColor,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.title}
                  </span>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 10,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      ✏ EDIT
                    </button>
                  )}
                </div>

                {isPullQuote ? (
                  <div style={{ position: "relative" }}>
                    <span style={{ fontSize: 28, color: "#FFD700", lineHeight: 0.8, opacity: 0.5 }}>“</span>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 14,
                        fontStyle: "italic",
                        lineHeight: 1.6,
                        color: "#FFF8E7",
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {item.body}
                    </p>
                  </div>
                ) : isNoteCard ? (
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.9)" }}>
                    {item.body.split("\n").map((line, i) => (
                      <div key={i} style={{ marginBottom: 4 }}>
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {item.body}
                  </p>
                )}
              </div>

              {item.visibility !== "PUBLIC" && isOwner && (
                <div style={{ marginTop: 12, fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>
                  🔒 {item.visibility}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Edit Modal for Owner */}
      {editingEntry && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(5, 5, 16, 0.85)",
            backdropFilter: "blur(12px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#0d091a",
              border: `1.5px solid ${accentColor}66`,
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 900, color: "#fff" }}>
              EDIT PERSONAL EXPRESSION
            </h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 9, fontWeight: 800, color: accentColor, marginBottom: 6 }}>
                CARD TITLE
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 9, fontWeight: 800, color: accentColor, marginBottom: 6 }}>
                BODY / THOUGHTS
              </label>
              <textarea
                rows={5}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  background: accentColor,
                  color: "#050510",
                  fontSize: 11,
                  fontWeight: 900,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                SAVE & PUBLISH
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
