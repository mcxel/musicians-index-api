import { Suspense } from "react";
import ArtistProfileHub from '@/components/tmi/artist/ArtistProfileHub';
import JuliusHudDock from "@/components/julius/JuliusHudDock";

export default function ArtistsPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen animate-pulse bg-[#06040f]" />}>
        <ArtistProfileHub />
      </Suspense>
      <Suspense fallback={null}>
        <JuliusHudDock surface="artist-profile" compact />
      </Suspense>
    </>
  );
}

