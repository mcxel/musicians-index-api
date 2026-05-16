"use client";

import { useEffect, useState } from "react";

type User = { id: string; name: string };

const NAMES = [
  "JayBeats",
  "MicahFlow",
  "AcePrime",
  "NovaBars",
  "LunaKeys",
  "TrapGhost",
  "RicoWave",
  "SynthKid",
];

interface PresenceStripProps {
  currentUser?: string;
}

export default function PresenceStrip({ currentUser }: PresenceStripProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // seed with 3 users
    setUsers(NAMES.slice(0, 3).map((name, i) => ({ id: `u${i}`, name })));

    const id = setInterval(() => {
      setUsers((prev) => {
        if (prev.length < 6 && Math.random() > 0.5) {
          const next = NAMES[Math.floor(Math.random() * NAMES.length)];
          return [...prev, { id: `${Date.now()}`, name: next }];
        }
        return prev.slice(1); // simulate leave
      });
    }, 4000);

    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", gap: 8, padding: "8px 12px", flexWrap: "wrap" }}>
      {currentUser && (
        <div
          style={{
            fontSize: 10,
            padding: "4px 8px",
            borderRadius: 6,
            background: "rgba(255, 45, 170, 0.15)",
            color: "#FF2DAA",
            fontWeight: 700,
          }}
        >
          {currentUser} (you)
        </div>
      )}
      {users.map((u) => (
        <div
          key={u.id}
          style={{
            fontSize: 10,
            padding: "4px 8px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        >
          {u.name}
        </div>
      ))}
    </div>
  );
}
