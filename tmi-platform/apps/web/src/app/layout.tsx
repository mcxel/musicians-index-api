import type { Metadata } from "next";
import AppProviders from "@/components/providers";
import "./globals.css";
import "@/styles/tmiTypography.css";
import "@/styles/tmi/globals.css";

export const metadata: Metadata = {
  title: "The Musician's Index",
  description: "Join live music rooms, connect with artists, and perform in real time. The live arena where music is made, ranked, and rewarded.",
  metadataBase: new URL("https://themusiciansindex.com"),
  openGraph: {
    title: "The Musician's Index — Live Music World",
    description: "Join live music rooms, connect with artists, and perform in real time.",
    siteName: "The Musician's Index",
    url: "https://themusiciansindex.com",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Musician's Index — Live Music World",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Musician's Index — Live Music World",
    description: "Join live music rooms, connect with artists, and perform in real time.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
