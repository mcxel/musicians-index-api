import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Danika's Law",
    default: "Danika's Law — Legal Guidance Platform",
  },
  description:
    "AI-powered legal guidance for musicians, artists, and creators. Get answers fast.",
  metadataBase: new URL("https://law.berntout.com"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0a0a0f", color: "#f0f0f0" }}>
        {children}
      </body>
    </html>
  );
}
