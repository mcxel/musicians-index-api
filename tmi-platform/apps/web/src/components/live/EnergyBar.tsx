"use client";

import { useEffect, useState } from "react";

interface EnergyBarProps {
  energy?: number;
}

export default function EnergyBar({ energy: propEnergy }: EnergyBarProps) {
  const [energy, setEnergy] = useState(propEnergy ?? 40);

  useEffect(() => {
    // only auto-increment if energy is not controlled by props
    if (propEnergy !== undefined) {
      setEnergy(propEnergy);
      return;
    }

    const id = setInterval(() => {
      setEnergy((e) => {
        const next = e + (Math.random() * 20 - 10);
        return Math.max(10, Math.min(100, next));
      });
    }, 2000);

    return () => clearInterval(id);
  }, [propEnergy]);

  return (
    <div style={{ padding: "6px 12px" }}>
      <div
        style={{
          height: 6,
          borderRadius: 4,
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            width: `${energy}%`,
            height: "100%",
            background: "#ff4fd8",
            borderRadius: 4,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
