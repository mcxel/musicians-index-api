"use client";

/**
 * HostAvatarPresence
 *
 * Renders a host's 2D portrait with:
 *   - Framer Motion idle float/sway (always running)
 *   - CSS blink overlay driven by HostBlinkEngine timing
 *   - Neon glow pulse when isSpeaking is true
 *   - Interactive chat panel (calls /api/hosts/[hostId]/chat)
 *
 * This is the honest, buildable step toward animated hosts: real portrait
 * images with real idle motion and a real conversational AI backend.
 * Full 3D rigging/lip sync is a future phase requiring dedicated 3D assets.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HostBlinkEngine } from "@/lib/hosts/HostBlinkEngine";
import type { HostIdentity } from "@/lib/hosts/HostIdentityRegistry";
import type { ChatMessage } from "@/lib/hosts/HostIntelligenceEngine";

interface HostAvatarPresenceProps {
  host: HostIdentity;
  /** When true, a neon speaking glow pulses around the portrait */
  isSpeaking?: boolean;
  /** Size in pixels — portrait is always square */
  size?: number;
  /** If true, shows the chat panel below the portrait */
  showChat?: boolean;
  className?: string;
}

export default function HostAvatarPresence({
  host,
  isSpeaking = false,
  size = 200,
  showChat = false,
  className = "",
}: HostAvatarPresenceProps) {
  const [blinkVisible, setBlinkVisible] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Blink loop driven by HostBlinkEngine timing
  useEffect(() => {
    if (!host.portraitUrl) return;

    function scheduleBlink() {
      const intervalMs = HostBlinkEngine.nextIntervalMs();
      blinkTimerRef.current = setTimeout(() => {
        setBlinkVisible(true);
        // Total blink duration: closing(60) + closed(40) + opening(70) = 170ms
        setTimeout(() => setBlinkVisible(false), 170);
        scheduleBlink();
      }, intervalMs);
    }

    scheduleBlink();
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [host.portraitUrl]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch(`/api/hosts/${host.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages.slice(-6) }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Hey! I'm ${host.shortName} — thanks for chatting!` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, host.id, host.shortName]);

  const glowColor = host.colorHex ?? "#00FFFF";

  return (
    <div
      className={className}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}
    >
      {/* Portrait container */}
      <motion.div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
          cursor: showChat ? "pointer" : "default",
          boxShadow: isSpeaking
            ? `0 0 0 3px ${glowColor}, 0 0 24px 8px ${glowColor}88`
            : `0 0 0 2px ${glowColor}44`,
          transition: "box-shadow 0.2s ease",
        }}
        // Idle float animation
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => showChat && setChatOpen((v) => !v)}
        title={showChat ? `Chat with ${host.name}` : host.name}
      >
        {host.portraitUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={host.portraitUrl}
              alt={host.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Blink overlay — briefly darkens the upper-third of the portrait */}
            <AnimatePresence>
              {blinkVisible && (
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 0.7 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{ duration: 0.07 }}
                  style={{
                    position: "absolute",
                    top: "28%",
                    left: 0,
                    width: "100%",
                    height: "18%",
                    background: "rgba(0,0,0,0.85)",
                    transformOrigin: "center",
                    pointerEvents: "none",
                    borderRadius: 4,
                  }}
                />
              )}
            </AnimatePresence>
          </>
        ) : (
          // No portrait: styled initial placeholder using the host's color
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${host.colorHex}33, ${host.accentColorHex}55)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: size * 0.36,
              color: host.colorHex,
              fontWeight: 700,
              fontFamily: "monospace",
              letterSpacing: -1,
            }}
          >
            {host.shortName.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Speaking pulse ring */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.96, 1.04, 0.96] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: `2px solid ${glowColor}`,
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Host name badge */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: glowColor,
          letterSpacing: 1,
          textTransform: "uppercase",
          fontFamily: "monospace",
        }}
      >
        {host.shortName}
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {showChat && chatOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              width: Math.max(size, 280),
              background: "#06070d",
              border: `1px solid ${glowColor}44`,
              borderRadius: 10,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Chat header */}
            <div
              style={{
                padding: "8px 12px",
                background: `${glowColor}18`,
                borderBottom: `1px solid ${glowColor}33`,
                fontSize: 11,
                color: glowColor,
                fontWeight: 700,
                fontFamily: "monospace",
                letterSpacing: 1,
              }}
            >
              CHAT WITH {host.name.toUpperCase()}
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                maxHeight: 220,
                overflowY: "auto",
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {messages.length === 0 && (
                <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic", textAlign: "center", padding: 8 }}>
                  Say hi to {host.shortName}!
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    background: msg.role === "user" ? `${glowColor}22` : "#1e293b",
                    border: msg.role === "user" ? `1px solid ${glowColor}44` : "1px solid #334155",
                    borderRadius: 8,
                    padding: "5px 9px",
                    fontSize: 12,
                    color: msg.role === "user" ? "#e2e8f0" : glowColor,
                    lineHeight: 1.4,
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: "flex-start", fontSize: 11, color: glowColor, fontStyle: "italic" }}>
                  {host.shortName} is typing…
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: 8,
                borderTop: `1px solid ${glowColor}22`,
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Say something…"
                maxLength={500}
                style={{
                  flex: 1,
                  background: "#0f172a",
                  border: `1px solid ${glowColor}44`,
                  borderRadius: 6,
                  padding: "5px 9px",
                  fontSize: 12,
                  color: "#e2e8f0",
                  outline: "none",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  background: glowColor,
                  color: "#020617",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: inputValue.trim() && !isLoading ? "pointer" : "not-allowed",
                  opacity: inputValue.trim() && !isLoading ? 1 : 0.4,
                }}
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
