import { ImageSlotWrapper } from '@/components/visual-enforcement';
import Link from "next/link";
import type { TopArtistFaceEntry } from "./top10FaceData";
import { resolveCtaPath } from "@/lib/ctaContractMap";

type GenreOrbitFaceCardProps = {
  artist: TopArtistFaceEntry;
  angle: number;
  radius: number;
  orbitDuration: number;
};

// Pure-CSS clockwise orbit:
// 1. Outer pivot (zero-size div at center) rotates CW 0→360
// 2. Inner card translates to `radius`px and counter-rotates to stay upright
// Negative animationDelay offsets each card to its starting angle instantly.
function buildKf(radius: number): string {
  return `
@keyframes tmi-orbit-cw { to { transform: rotate(360deg); } }
@keyframes tmi-orbit-ccw-${radius} {
  from { transform: translateX(${radius}px) translateY(-50%) rotate(0deg); }
  to   { transform: translateX(${radius}px) translateY(-50%) rotate(-360deg); }
}`;
}

export default function GenreOrbitFaceCard({ artist, angle, radius, orbitDuration }: GenreOrbitFaceCardProps) {
  const profileHref = resolveCtaPath("artist-card-profile", { slug: artist.id });
  // Negative delay = card starts at its angle immediately with no visual jump
  const delay = `${(-angle / 360) * orbitDuration}s`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: buildKf(radius) }} />

      {/* Outer pivot — zero-size, sits at container center, rotates CW */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 0,
          height: 0,
          animation: `tmi-orbit-cw ${orbitDuration}s linear ${delay} infinite`,
        }}
      >
        {/* Inner — translates to radius, counter-rotates so card stays upright */}
        <div
          style={{
            position: "absolute",
            animation: `tmi-orbit-ccw-${radius} ${orbitDuration}s linear ${delay} infinite`,
          }}
        >
          <Link href={profileHref} className="group block">
            <div
              className="relative overflow-hidden rounded-full border border-cyan-300/45 bg-black/70 shadow-[0_0_14px_rgba(34,211,238,0.28)] transition-transform duration-200 group-hover:scale-110"
              style={{ width: 56, height: 56 }}
            >
              <ImageSlotWrapper
                imageId={`artist-face-${artist.id}`}
                roomId="genre-orbit"
                priority="normal"
                className="w-full h-full object-cover"
                altText={artist.name ?? "Artist"}
                containerStyle={{ width: "100%", height: "100%" }}
              />
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[8px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ top: "100%", background: "rgba(0,0,0,0.8)", border: "1px solid rgba(0,255,255,0.3)" }}
            >
              {artist.name}
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
