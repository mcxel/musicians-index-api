/**
 * PROMPT #3B: Chat Bubbles Layer
 * Displays floating seat-anchored bubbles + pinned screen popups
 * Artist/audience styling + collision avoidance
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { EnhancedSeatState } from './SeatMap';

export type ChatMessageKind = 'NORMAL' | 'HYPE' | 'TIP' | 'PINNED' | 'MOD' | 'SPONSORED';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: number;
  kind: ChatMessageKind;
  seatId?: string; // For seat-anchored bubbles
  expiresAt?: number; // Auto-expire time (ms)
}

export interface ChatBubblesLayerProps {
  messages: ChatMessage[];
  seats: EnhancedSeatState[];
  showSeatBubbles?: boolean;
  showPinnedBubbles?: boolean;
  maxPinnedBubbles?: number;
  seatBubbleDuration?: number; // Default 3500ms
  pinnedBubbleDuration?: number; // Default 6000ms
  className?: string;
}

// Styling for different message kinds
const MESSAGE_STYLES: Record<ChatMessageKind, { bg: string; border: string; shadow: string; textColor: string }> = {
  NORMAL: { bg: 'rgba(30, 30, 30, 0.92)', border: '#444', shadow: 'rgba(0,0,0,0.5)', textColor: '#FFF' },
  HYPE: { bg: 'rgba(255, 100, 100, 0.95)', border: '#FF1744', shadow: 'rgba(255, 23, 68, 0.6)', textColor: '#FFF' },
  TIP: { bg: 'rgba(255, 193, 7, 0.95)', border: '#FFD700', shadow: 'rgba(255, 215, 0, 0.7)', textColor: '#000' },
  PINNED: { bg: 'rgba(76, 175, 80, 0.95)', border: '#4CAF50', shadow: 'rgba(76, 175, 80, 0.6)', textColor: '#FFF' },
  MOD: { bg: 'rgba(244, 67, 54, 0.95)', border: '#F44336', shadow: 'rgba(244, 67, 54, 0.7)', textColor: '#FFF' },
  SPONSORED: { bg: 'rgba(156, 39, 176, 0.95)', border: '#9C27B0', shadow: 'rgba(156, 39, 176, 0.7)', textColor: '#FFF' },
};

export const ChatBubblesLayer: React.FC<ChatBubblesLayerProps> = ({
  messages,
  seats,
  showSeatBubbles = true,
  showPinnedBubbles = true,
  maxPinnedBubbles = 4,
  seatBubbleDuration = 3500,
  pinnedBubbleDuration = 6000,
  className = '',
}) => {
  const [activeSeatBubbles, setActiveSeatBubbles] = useState<ChatMessage[]>([]);
  const [activePinnedBubbles, setActivePinnedBubbles] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const now = Date.now();

    // Filter seat-anchored bubbles
    const seatBubbles = messages.filter(
      (m) => m.seatId && (m.expiresAt ? now < m.expiresAt : now - m.createdAt < seatBubbleDuration)
    );
    setActiveSeatBubbles(seatBubbles);

    // Filter pinned screen popups (max limit)
    const pinnedBubbles = messages
      .filter((m) => m.kind === 'PINNED' && (m.expiresAt ? now < m.expiresAt : now - m.createdAt < pinnedBubbleDuration))
      .slice(-maxPinnedBubbles); // Keep most recent
    setActivePinnedBubbles(pinnedBubbles);

    // Cleanup timer
    const timeout = setTimeout(() => {
      setActiveSeatBubbles(
        messages.filter((m) => m.seatId && (m.expiresAt ? Date.now() < m.expiresAt : Date.now() - m.createdAt < seatBubbleDuration))
      );
      setActivePinnedBubbles(
        messages
          .filter((m) => m.kind === 'PINNED' && (m.expiresAt ? Date.now() < m.expiresAt : Date.now() - m.createdAt < pinnedBubbleDuration))
          .slice(-maxPinnedBubbles)
      );
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages, seatBubbleDuration, pinnedBubbleDuration, maxPinnedBubbles]);

  // Find seat position
  const getSeatPosition = (seatId: string): { x: number; y: number } | null => {
    const seat = seats.find((s) => s.id === seatId);
    return seat ? { x: seat.position.x, y: seat.position.y } : null;
  };

  // Collision avoidance: stack vertically if too close
  const stackBubbles = (bubbles: ChatMessage[]): Map<string, number> => {
    const stacks = new Map<string, number>();
    const grouped = new Map<string, ChatMessage[]>();

    bubbles.forEach((b) => {
      if (!b.seatId) return;
      const key = b.seatId;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(b);
    });

    grouped.forEach((group, key) => {
      group.forEach((b, i) => {
        stacks.set(b.id, i);
      });
    });

    return stacks;
  };

  const seatBubbleStacks = stackBubbles(activeSeatBubbles);

  return (
    <div className={`chat-bubbles-layer ${className}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1100 }}>
      {/* Seat-anchored bubbles */}
      {showSeatBubbles &&
        activeSeatBubbles.map((msg) => {
          const pos = msg.seatId ? getSeatPosition(msg.seatId) : null;
          if (!pos) return null;

          const stackIndex = seatBubbleStacks.get(msg.id) || 0;
          const yOffset = -50 - stackIndex * 40; // Stack upward
          const style = MESSAGE_STYLES[msg.kind];
          const elapsed = Date.now() - msg.createdAt;
          const progress = msg.expiresAt ? Math.min(elapsed / (msg.expiresAt - msg.createdAt), 1) : elapsed / seatBubbleDuration;
          const opacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2; // Fade at end

          return (
            <div
              key={msg.id}
              className="seat-bubble"
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y + yOffset,
                transform: 'translateX(-50%)',
                background: style.bg,
                border: `2px solid ${style.border}`,
                color: style.textColor,
                padding: '6px 12px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                maxWidth: 200,
                boxShadow: `0 2px 8px ${style.shadow}`,
                opacity,
                transition: 'opacity 0.2s ease-out',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 2 }}>{msg.username}</div>
              <div>{msg.content}</div>
            </div>
          );
        })}

      {/* Pinned screen popups (top-right) */}
      {showPinnedBubbles &&
        activePinnedBubbles.map((msg, i) => {
          const style = MESSAGE_STYLES[msg.kind];
          const elapsed = Date.now() - msg.createdAt;
          const progress = msg.expiresAt ? Math.min(elapsed / (msg.expiresAt - msg.createdAt), 1) : elapsed / pinnedBubbleDuration;
          const opacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2;
          const scale = progress < 0.1 ? 0.5 + progress / 0.1 * 0.5 : progress > 0.9 ? 1 - (progress - 0.9) / 0.1 * 0.3 : 1; // Pop in/out

          return (
            <div
              key={msg.id}
              className="pinned-bubble"
              style={{
                position: 'absolute',
                top: 20 + i * 80,
                right: 20,
                background: style.bg,
                border: `3px solid ${style.border}`,
                color: style.textColor,
                padding: '10px 16px',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 600,
                maxWidth: 300,
                boxShadow: `0 4px 16px ${style.shadow}`,
                opacity,
                transform: `scale(${scale})`,
                transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{msg.username}</div>
              <div>{msg.content}</div>
              {msg.kind === 'TIP' && <div style={{ marginTop: 4, fontSize: 12, opacity: 0.9 }}>💰 Tip</div>}
              {msg.kind === 'SPONSORED' && <div style={{ marginTop: 4, fontSize: 10, opacity: 0.8 }}>Sponsored Message</div>}
            </div>
          );
        })}
    </div>
  );
};

export default ChatBubblesLayer;
