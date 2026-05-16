"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "🔥 that was hard",
  "who next?",
  "yo run that back",
  "crowd going crazy",
  "beat drop incoming",
  "nahhh that flow 🔥",
];

interface AutoChatProps {
  userMessages?: string[];
}

export default function AutoChat({ userMessages = [] }: AutoChatProps) {
  const [chat, setChat] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setChat((c) => [...c.slice(-4), msg]);
    }, 2500);

    return () => clearInterval(id);
  }, []);

  const allMessages = [...chat, ...userMessages];
  const displayMessages = allMessages.slice(-6);

  return (
    <div style={{ padding: 12 }}>
      {displayMessages.map((m, i) => {
        const isUserMessage = userMessages.includes(m);
        return (
          <div
            key={i}
            style={{
              fontSize: 12,
              color: isUserMessage ? "rgba(255, 45, 170, 0.9)" : "rgba(255,255,255,0.8)",
              marginBottom: 4,
              fontWeight: isUserMessage ? 600 : 400,
            }}
          >
            {isUserMessage ? `💬 ${m}` : m}
          </div>
        );
      })}
    </div>
  );
}
