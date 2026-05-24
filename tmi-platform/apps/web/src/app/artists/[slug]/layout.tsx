import type { Metadata } from 'next';

function titleCase(slug: string) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const name = titleCase(slug);
  return {
    title: `${name} — Artist Profile`,
    description: `${name} on The Musician's Index — live performances, battle record, stats, music, and upcoming shows.`,
    openGraph: {
      title: `${name} | The Musician's Index`,
      description: `${name} — live performances, battle record, music catalog, and fan engagement on TMI.`,
      url: `https://themusiciansindex.com/artists/${slug}`,
      images: [{ url: "https://themusiciansindex.com/og-image.jpg", width: 1200, height: 630, alt: `${name} on TMI` }],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | TMI`,
      description: `${name} — live performances, battle record, and music on The Musician's Index.`,
      images: ["https://themusiciansindex.com/og-image.jpg"],
    },
  };
}

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
