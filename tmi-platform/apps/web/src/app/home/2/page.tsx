import type { Metadata } from 'next';
import Home2NewsDeskSurface from "@/components/home/Home2NewsDeskSurface";

export const metadata: Metadata = {
  title: "News Desk — Music News, Interviews & Studio Recaps",
  description: "Breaking music news, exclusive artist interviews, studio recaps, and genre discovery on The Musician's Index Magazine.",
  openGraph: {
    title: "Music News & Interviews | The Musician's Index",
    description: "Breaking music news, exclusive artist interviews, studio recaps, and discovery. Your editorial home for the scene.",
    url: "https://themusiciansindex.com/home/2",
    images: [{ url: "https://themusiciansindex.com/og-image.jpg", width: 1200, height: 630, alt: "TMI News Desk" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Music News & Interviews | TMI Magazine",
    description: "Breaking music news, exclusive artist interviews, studio recaps, and discovery.",
    images: ["https://themusiciansindex.com/og-image.jpg"],
  },
};

export default function Home2Page() {
  return <Home2NewsDeskSurface />;
}
