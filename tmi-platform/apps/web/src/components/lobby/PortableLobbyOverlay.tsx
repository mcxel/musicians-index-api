"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotLobbyScheduler, AutomatedBotRoom } from "@/lib/bots/BotLobbyScheduler";

export interface PortableLobbyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "FAN" | "PERFORMER" | "ADMIN";
  onInstantJoin?: (roomId: string, role: "FAN" | "PERFORMER") => void;
}

const CATEGORIES = ["ALL", "Hip-Hop", "Rap", "R&B", "EDM", "Gospel", "Comedy", "Rock"];

export default function PortableLobbyOverlay({
  isOpen,
  onClose,
  userRole = "FAN",
  onInstantJoin,
}: PortableLobbyOverlayProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeBattleRoomId, setActiveBattleRoomId] = useState<string | null>(null);

  const rooms: AutomatedBotRoom[] = BotLobbyScheduler.getRooms();

  const filteredRooms =
    selectedCategory === "ALL"
      ? rooms
      : rooms.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());

  if (!isOpen) return null;

  const handleRoomClick = (roomId: string) => {
    if (onInstantJoin) {
      onInstantJoin(roomId, userRole === "PERFORMER" ? "PERFORMER" : "FAN");
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div style={{ position: "fixed", inset: 0, zIndex: 99900, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "absolute", inset: 0, background: "rgba(5,5,16,0.8)", backdropFilter: "blur(12px)" }}
        />

        {/* Portable Keypad Overlay Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            maxHeight: "85vh",
            background: "#080816",
            border: "1.5px solid rgba(0,255,255,0.4)",
            borderRadius: 20,
            boxShadow: "0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            zIndex: 99901,
          }}
        >
          {/* Keypad Overlay Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#00FFFF", fontWeight: 900 }}>PORTABLE LOBBY DIRECTORY</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", margin: "2px 0 0" }}>
                Instant Room Join · {userRole} MODE
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}
            >
              ✕
            </button>
          </div>

          {/* Horizontal Category Selector */}
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "12px 16px",
              overflowX: "auto",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 16,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.05em",
                    border: active ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.1)",
                    background: active ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.03)",
                    color: active ? "#00FFFF" : "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Vertical Live WebRTC Room List */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredRooms.map((room) => (
              <div
                key={room.roomId}
                onClick={() => handleRoomClick(room.roomId)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1.5px solid rgba(0,255,255,0.5)",
                      position: "relative",
                      background: "#000",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={room.botHost.profileImageUrl}
                      alt={room.roomName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{room.roomName}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                      Host: {room.botHost.name} · {room.category}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span style={{ background: "#FF2DAA", color: "#fff", fontSize: 7, fontWeight: 900, padding: "2px 6px", borderRadius: 4 }}>
                    ● WEBRTC LIVE
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoomClick(room.roomId);
                    }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: userRole === "PERFORMER" ? "1px solid #FFD700" : "1px solid #00FFFF",
                      background: userRole === "PERFORMER" ? "rgba(255,215,0,0.2)" : "rgba(0,255,255,0.2)",
                      color: userRole === "PERFORMER" ? "#FFD700" : "#00FFFF",
                      fontSize: 8,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {userRole === "PERFORMER" ? "START BATTLE" : "TAKE SEAT"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Keypad Footer */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center", background: "rgba(0,0,0,0.4)" }}>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ✕ Close Directory
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
