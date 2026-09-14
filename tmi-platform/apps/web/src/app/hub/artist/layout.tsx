"use client";

import type { ReactNode } from "react";
import CanonicalRoleShellChrome from "@/components/shell/CanonicalRoleShellChrome";

const NAV = [
  { href: "/hub/artist", label: "Command Deck" },
  { href: "/hub/artist/analytics", label: "Analytics" },
  { href: "/hub/artist/booking", label: "Booking" },
  { href: "/beat-vault", label: "Beat Vault" },
  { href: "/nft", label: "NFT Studio" },
  { href: "/settings", label: "Settings" },
];

/** Artist hub aliases Performer-adjacent surfaces — same account grammar, not a second auth system. */
export default function ArtistHubLayout({ children }: { children: ReactNode }) {
  return (
    <CanonicalRoleShellChrome
      roleLabel="ARTIST HUB"
      subtitle="Live show · revenue · tips · backstage"
      accentColor="#00FFFF"
      homeHref="/home/1"
      navLinks={NAV}
    >
      {children}
    </CanonicalRoleShellChrome>
  );
}
