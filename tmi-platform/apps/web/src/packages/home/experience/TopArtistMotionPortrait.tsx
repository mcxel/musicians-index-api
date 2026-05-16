import Link from "next/link";
import { motion } from "framer-motion";
import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';
import type { TopArtistFaceEntry } from "./top10FaceData";
import { resolveCtaPath } from "@/lib/ctaContractMap";
import CrownPopAnimation from "@/packages/magazine-engine/CrownPopAnimation";
import RankNumberPop from "@/packages/magazine-engine/RankNumberPop";
import AwkwardShapeOverlayFrame from "@/packages/magazine-engine/AwkwardShapeOverlayFrame";

type TopArtistMotionPortraitProps = {
  artist: TopArtistFaceEntry;
  crownActive?: boolean;
  spotlit?: boolean;
};

export default function TopArtistMotionPortrait({
  artist,
  crownActive = false,
  spotlit = false,
}: TopArtistMotionPortraitProps) {
  const profileHref = resolveCtaPath("artist-card-profile", { slug: artist.id });

  return (
    <div
      className="top-artist-motion relative z-10 mx-auto w-full max-w-[220px]"
      data-testid="top-artist-motion-portrait"
      data-spotlit={spotlit}
    >
      {/* Crown pop sits above the portrait card */}
      <CrownPopAnimation
        active={crownActive}
        artistName={artist.name}
        size={52}
        data-testid="top-artist-crown-pop"
      />

      {/* Awkward shape overlay frame wraps the portrait — frame is decorative, img stays clean */}
      <AwkwardShapeOverlayFrame
        variant={spotlit ? "crown" : "magazine"}
        rank={1}
        animated
        showBackShapes={spotlit}
        data-testid="awkward-shape-overlay-frame"
      >
        <motion.div
          className="overflow-hidden rounded-2xl border border-yellow-300/60 bg-black/70 shadow-[0_0_24px_rgba(250,204,21,0.3)]"
          animate={{
            boxShadow: spotlit
              ? [
                  "0 0 28px rgba(255,215,0,0.5)",
                  "0 0 44px rgba(255,215,0,0.75)",
                  "0 0 28px rgba(255,215,0,0.5)",
                ]
              : [
                  "0 0 20px rgba(250,204,21,0.2)",
                  "0 0 28px rgba(250,204,21,0.45)",
                  "0 0 20px rgba(250,204,21,0.2)",
                ],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Link href={profileHref}>
            <motion.div
              className="h-44 w-full overflow-hidden"
              animate={{ scale: [1, 1.04, 1.02, 1], x: [0, 4, -3, 0], rotate: [0, 0.7, -0.6, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ImageSlotWrapper
                imageId={`top-artist-portrait-${artist.id ?? artist.name.replace(/\s+/g, '-').toLowerCase()}`}
                roomId="top-artist-motion-portrait"
                priority="high"
                fallbackUrl={artist.image}
                altText={`${artist.name} motion portrait`}
                className="h-44 w-full object-cover"
                containerStyle={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          </Link>
        </motion.div>
      </AwkwardShapeOverlayFrame>

      {/* Rank badge on spotlight */}
      {spotlit && (
        <RankNumberPop
          rank={1}
          active
          size="lg"
          position="top-right"
        />
      )}

      <div className="mt-2 rounded-xl border border-yellow-200/35 bg-black/65 px-3 py-2 text-center backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
          {spotlit ? "👑 #1 This Week" : "Featured #1"}
        </p>
        <p className="text-sm font-black uppercase tracking-wide text-white">{artist.name}</p>
      </div>
    </div>
  );
}
