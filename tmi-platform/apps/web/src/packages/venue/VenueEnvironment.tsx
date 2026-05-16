import type { ReactNode } from "react";

type VenueEnvironmentProps = {
  type?: "hole-in-the-wall" | "amphitheater" | "festival";
  ambientColor?: "gold" | "fuchsia" | "cyan" | "emerald";
  isOutdoor?: boolean;
  children: ReactNode;
};

export default function VenueEnvironment({
  type = "hole-in-the-wall",
  ambientColor = "cyan",
  isOutdoor = false,
  children,
}: VenueEnvironmentProps) {
  const accent =
    ambientColor === "gold"
      ? "rgba(250,204,21,0.2)"
      : ambientColor === "fuchsia"
      ? "rgba(217,70,239,0.2)"
      : ambientColor === "emerald"
      ? "rgba(16,185,129,0.2)"
      : "rgba(34,211,238,0.2)";

  return (
    <section
      data-venue-type={type}
      data-venue-outdoor={isOutdoor ? "1" : "0"}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 p-6"
      style={{ boxShadow: `inset 0 0 80px ${accent}` }}
    >
      {children}
    </section>
  );
}
