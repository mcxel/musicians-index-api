import { ImageSlotWrapper } from '@/components/visual-enforcement';
import Link from "next/link";
import { motion } from "framer-motion";
import type { TopArtistFaceEntry } from "./top10FaceData";
import { resolveCtaPath } from "@/lib/ctaContractMap";

type ArtistFaceCardProps = {
  artist: TopArtistFaceEntry;
  featured?: boolean;
  index: number;
};

export default function ArtistFaceCard({ artist, featured = false, index }: ArtistFaceCardProps) {
  const profileHref = resolveCtaPath("artist-card-profile", { slug: artist.id });
  const articleHref = resolveCtaPath("artist-card-article", { slug: artist.id });
  const liveHref = resolveCtaPath("artist-card-live", { slug: artist.id });
  const bookingHref = resolveCtaPath("artist-card-booking", { artistId: artist.id });

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className={`group relative overflow-hidden rounded-2xl border ${
        featured
          ? "border-yellow-400/70 shadow-[0_0_28px_rgba(250,204,21,0.35)]"
          : "border-cyan-400/35 shadow-[0_0_22px_rgba(34,211,238,0.2)]"
      } bg-black/55 backdrop-blur-sm`}
      data-artist-id={artist.id}
    >
      <div className="relative h-36 sm:h-40 md:h-44 overflow-hidden">
        <ImageSlotWrapper imageId="img-n60ek5" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <span className="absolute top-2 left-2 rounded-full bg-black/75 px-2 py-1 text-[10px] font-black tracking-widest text-cyan-200 border border-cyan-300/35">
          #{artist.rank}
        </span>

        {artist.isCrowned && (
          <span className="absolute top-2 right-2 rounded-full bg-yellow-400/95 px-2 py-1 text-[10px] font-black tracking-widest text-black animate-pulse">
            CROWN
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-white truncate">{artist.name}</h3>
          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/75">{artist.genreLabel} • {artist.score}</p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 opacity-95 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <Link href={profileHref} className="rounded-md border border-cyan-300/40 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-100 text-center hover:bg-cyan-400/20">
            Profile
          </Link>
          <Link href={articleHref} className="rounded-md border border-fuchsia-300/40 bg-fuchsia-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-100 text-center hover:bg-fuchsia-400/20">
            Article
          </Link>
          <Link href={liveHref} className="rounded-md border border-emerald-300/40 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100 text-center hover:bg-emerald-400/20">
            Live
          </Link>
          <Link href={bookingHref} className="rounded-md border border-yellow-300/40 bg-yellow-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-100 text-center hover:bg-yellow-400/20">
            Book
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
