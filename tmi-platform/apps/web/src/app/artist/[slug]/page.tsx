
import { notFound } from "next/navigation";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistBio from "@/components/artist/ArtistBio";
import ArtistStats from "@/components/artist/ArtistStats";
import ArtistMusic from "@/components/artist/ArtistMusic";
import ArtistAlbums from "@/components/artist/ArtistAlbums";
import ArtistVideos from "@/components/artist/ArtistVideos";
import ArtistArticles from "@/components/artist/ArtistArticles";
import ArtistShows from "@/components/artist/ArtistShows";
import ArtistSponsors from "@/components/artist/ArtistSponsors";
import ArtistComments from "@/components/artist/ArtistComments";

interface ArtistData {
  id: string;
  slug: string | null;
  stageName: string | null;
  bio: string | null;
  genres: string[];
  followers: number;
  views: number;
  verified: boolean;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
    artist?: {
      id: string;
      name: string | null;
      bio: string | null;
      musicLinks?: Array<{ platform: string; url: string }>;
    } | null;
  } | null;
}

async function getArtist(slug: string): Promise<ArtistData | null> {
  const base = process.env.API_BASE_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/artist/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<ArtistData>;
  } catch {
    return null;
  }
}

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "#060610", color: "white", paddingBottom: 60 }}>
      <ArtistHeader artist={artist} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <ArtistBio bio={artist.user?.artist?.bio ?? artist.bio ?? null} />
        <ArtistStats followers={artist.followers} views={artist.views} verified={artist.verified} genres={artist.genres} />
        <ArtistMusic musicLinks={artist.user?.artist?.musicLinks ?? []} />
        <ArtistAlbums />
        <ArtistVideos />
        <ArtistArticles />
        <ArtistShows />
        <ArtistSponsors />
        <ArtistComments />
      </div>
    </div>
  );
}
