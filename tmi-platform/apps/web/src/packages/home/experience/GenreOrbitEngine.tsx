import { AnimatePresence, motion } from "framer-motion";
import type { GenreKey, TopArtistFaceEntry } from "./top10FaceData";
import GenreOrbitFaceCard from "./GenreOrbitFaceCard";
import TopArtistMotionPortrait from "./TopArtistMotionPortrait";

type GenreOrbitEngineProps = {
  genre: GenreKey;
  entries: TopArtistFaceEntry[];
  isFading: boolean;
  crownActive?: boolean;
  spotlit?: boolean;
};

export default function GenreOrbitEngine({ genre, entries, isFading, crownActive = false, spotlit = false }: GenreOrbitEngineProps) {
  const featured = entries[0];
  const orbiters = entries.slice(1, 9);
  const angleStep = 360 / Math.max(1, orbiters.length);

  if (!featured) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={genre}
        className={`genre-orbit-engine relative mx-auto h-[340px] w-full max-w-[520px] ${isFading ? "opacity-35" : "opacity-100"}`}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.02, y: -8 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="absolute inset-0 rounded-full border border-cyan-300/20" />
        <div className="absolute inset-6 rounded-full border border-fuchsia-300/20" />
        <div className="absolute inset-10 rounded-full border border-emerald-300/15" />

        {orbiters.map((artist, i) => (
          <GenreOrbitFaceCard
            key={`${genre}-${artist.id}`}
            artist={artist}
            angle={i * angleStep}
            radius={130}
            orbitDuration={18}
          />
        ))}

        <div className="absolute left-1/2 top-1/2 w-full max-w-[250px] -translate-x-1/2 -translate-y-1/2">
          <TopArtistMotionPortrait artist={featured} crownActive={crownActive} spotlit={spotlit} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
