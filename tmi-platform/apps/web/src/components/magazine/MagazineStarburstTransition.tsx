"use client";

import type { MagazineRuntimePhase } from "@/engines/magazine/MagazineRuntimeEngine";

type MagazineStarburstTransitionProps = {
  active: boolean;
  phase: MagazineRuntimePhase;
};

const SHARD_COUNT = 24;

export default function MagazineStarburstTransition({ active, phase }: MagazineStarburstTransitionProps) {
  if (!active || phase === "holding") {
    return null;
  }

  const shards = Array.from({ length: SHARD_COUNT }, (_, index) => {
    const angle = (index / SHARD_COUNT) * Math.PI * 2;
    const distance = 160 + (index % 6) * 38;
    return {
      id: `shard-${index}`,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      rot: -35 + (index % 12) * 8,
      delay: (index % 6) * 24,
      size: 8 + (index % 5) * 5,
      hue: index % 3,
    };
  });

  return (
    <div className="magazine-starburst" aria-hidden="true">
      <div className="magazine-starburst-core" />
      {shards.map((shard) => (
        <span
          key={shard.id}
          className="magazine-starburst-shard"
          style={
            {
              "--tx": `${shard.tx}px`,
              "--ty": `${shard.ty}px`,
              "--rot": `${shard.rot}deg`,
              "--delay": `${shard.delay}ms`,
              "--size": `${shard.size}px`,
              "--hue": `${shard.hue}`,
            } as React.CSSProperties
          }
        />
      ))}
      <style jsx>{`
        .magazine-starburst {
          position: absolute;
          inset: 0;
          z-index: 45;
          pointer-events: none;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .magazine-starburst-core {
          width: 140px;
          height: 140px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 45, 170, 0.45) 42%, rgba(0, 255, 255, 0) 72%);
          filter: blur(2px);
          animation: core-pop 420ms ease-out forwards;
          mix-blend-mode: screen;
        }

        .magazine-starburst-shard {
          position: absolute;
          width: var(--size);
          height: calc(var(--size) * 1.8);
          left: calc(50% - (var(--size) / 2));
          top: calc(50% - (var(--size) / 2));
          border-radius: 3px;
          background: linear-gradient(
            160deg,
            color-mix(in srgb, #00ffff calc(40% + var(--hue) * 10%), #ff2daa),
            color-mix(in srgb, #ffd700 calc(36% + var(--hue) * 8%), #aa2dff)
          );
          box-shadow:
            0 0 12px rgba(0, 255, 255, 0.55),
            0 0 18px rgba(255, 45, 170, 0.4);
          transform: translate3d(0, 0, 0) rotate(0deg) scale(0.75);
          animation: shard-burst 900ms cubic-bezier(0.16, 0.84, 0.35, 1) forwards;
          animation-delay: var(--delay);
          opacity: 0;
        }

        @keyframes core-pop {
          0% {
            opacity: 0;
            transform: scale(0.2);
          }
          30% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        @keyframes shard-burst {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.4);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--tx), var(--ty), 0) rotate(var(--rot)) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
