"use client";

type ProfileConfettiLayerProps = {
  enabled?: boolean;
};

export default function ProfileConfettiLayer({ enabled = true }: ProfileConfettiLayerProps) {
  if (!enabled) return null;

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 24 }, (_, index) => {
        const left = (index * 4.1) % 100;
        const top = (index * 8.7) % 100;
        const color = index % 3 === 0 ? "#ff8f3a" : index % 3 === 1 ? "#5ad7ff" : "#ffd28a";
        return (
          <div
            key={`confetti-${index}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: `7px solid ${color}`,
              opacity: 0.22,
              transform: `rotate(${index * 18}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
