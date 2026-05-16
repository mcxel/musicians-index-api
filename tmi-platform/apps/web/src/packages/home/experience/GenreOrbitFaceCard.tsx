import { ImageSlotWrapper } from '@/components/visual-enforcement';
import Link from "next/link";
import { motion } from "framer-motion";
import type { TopArtistFaceEntry } from "./top10FaceData";
import { resolveCtaPath } from "@/lib/ctaContractMap";

type GenreOrbitFaceCardProps = {
  artist: TopArtistFaceEntry;
  angle: number;
  radius: number;
  orbitDuration: number;
};

export default function GenreOrbitFaceCard({ artist, angle, radius, orbitDuration }: GenreOrbitFaceCardProps) {
  const profileHref = resolveCtaPath("artist-card-profile", { slug: artist.id });

  return (
    <motion.div
      className="genre-orbit-face"
      style={{
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
      }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: orbitDuration, repeat: Infinity, ease: "linear" }}
    >
      <Link href={profileHref} className="group block">
        <div className="h-14 w-14 overflow-hidden rounded-full border border-cyan-300/45 bg-black/70 shadow-[0_0_14px_rgba(34,211,238,0.28)]">
          <ImageSlotWrapper imageId="img-806s8i" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        </div>
      </Link>
    </motion.div>
  );
}
