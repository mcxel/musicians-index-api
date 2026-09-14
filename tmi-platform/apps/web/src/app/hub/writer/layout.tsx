"use client";

import type { ReactNode } from "react";
import CanonicalRoleShellChrome from "@/components/shell/CanonicalRoleShellChrome";

const NAV = [
  { href: "/hub/writer", label: "Command Center" },
  { href: "/hub/writer/works", label: "Works" },
  { href: "/hub/writer/pitches", label: "Pitches" },
  { href: "/hub/writer/submissions", label: "Submissions" },
  { href: "/dashboard/writer", label: "Dashboard" },
  { href: "/editorial", label: "Editorial Desk" },
  { href: "/magazine", label: "Magazine" },
  { href: "/settings", label: "Settings" },
];

export default function WriterHubLayout({ children }: { children: ReactNode }) {
  return (
    <CanonicalRoleShellChrome
      roleLabel="WRITER HUB"
      subtitle="Editorial Command Center"
      accentColor="#A3E635"
      homeHref="/home/1"
      navLinks={NAV}
    >
      {children}
    </CanonicalRoleShellChrome>
  );
}
