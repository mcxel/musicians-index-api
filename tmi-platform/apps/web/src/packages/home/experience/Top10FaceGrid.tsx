import { AnimatePresence, motion } from "framer-motion";
import type { GenreKey, TopArtistFaceEntry } from "./top10FaceData";
import ArtistFaceCard from "./ArtistFaceCard";

type Top10FaceGridProps = {
  genre: GenreKey;
  entries: TopArtistFaceEntry[];
  isFading: boolean;
};

export default function Top10FaceGrid({ genre, entries, isFading }: Top10FaceGridProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={genre}
        layout
        className={`relative z-10 grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1 ${isFading ? "opacity-35" : "opacity-100"}`}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -14, scale: 1.01 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {entries.map((artist, index) => (
          <div key={`${genre}-${artist.id}`} className={artist.rank === 1 ? "col-span-2 lg:col-span-2" : "col-span-1"}>
            <ArtistFaceCard artist={artist} featured={artist.rank === 1} index={index} />
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
