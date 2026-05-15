import type { Metadata } from "next";
import AppProviders from "@/components/providers";
import "./globals.css";
import "@/styles/tmiTypography.css";
import "@/styles/tmi/globals.css";

export const metadata: Metadata = {
  title: "The Musician's Index",
  description: "The live arena where music is made, ranked, and rewarded.",
  openGraph: {
    title: "The Musician's Index",
    description: "The live arena where music is made, ranked, and rewarded.",
    siteName: "The Musician's Index",
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
