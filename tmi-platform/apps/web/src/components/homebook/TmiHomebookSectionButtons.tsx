"use client";

import Link from "next/link";
import React from "react";

interface SectionButton {
  label: string;
  href: string;
  group: "page" | "section" | "role";
  color: string;
  textColor: string;
}

const SECTION_BUTTONS: SectionButton[] = [
  { label: "Home 1", href: "/home/1", group: "page", color: "border-cyan-400/40 hover:border-cyan-300", textColor: "text-cyan-200" },
  { label: "Home 1-2", href: "/home/1-2", group: "page", color: "border-fuchsia-400/40 hover:border-fuchsia-300", textColor: "text-fuchsia-200" },
  { label: "Home 2", href: "/home/2", group: "page", color: "border-emerald-400/40 hover:border-emerald-300", textColor: "text-emerald-200" },
  { label: "Home 3", href: "/home/3", group: "page", color: "border-amber-400/40 hover:border-amber-300", textColor: "text-amber-200" },
  { label: "Home 4", href: "/home/4", group: "page", color: "border-violet-400/40 hover:border-violet-300", textColor: "text-violet-200" },
  { label: "Home 5", href: "/home/5", group: "page", color: "border-rose-400/40 hover:border-rose-300", textColor: "text-rose-200" },
  { label: "Magazine", href: "/home/1", group: "section", color: "border-cyan-400/40 hover:border-cyan-300", textColor: "text-cyan-300" },
  { label: "Charts", href: "/leaderboard", group: "section", color: "border-fuchsia-400/40 hover:border-fuchsia-300", textColor: "text-fuchsia-300" },
  { label: "Cypher", href: "/cypher", group: "section", color: "border-emerald-400/40 hover:border-emerald-300", textColor: "text-emerald-300" },
  { label: "Live", href: "/lobby", group: "section", color: "border-red-400/40 hover:border-red-300", textColor: "text-red-300" },
  { label: "Store", href: "/store", group: "section", color: "border-amber-400/40 hover:border-amber-300", textColor: "text-amber-300" },
  { label: "About", href: "/articles", group: "section", color: "border-zinc-400/40 hover:border-zinc-300", textColor: "text-zinc-300" },
];

type TmiHomebookSectionButtonsProps = {
  className?: string;
  isLoggedIn?: boolean;
  role?: "fan" | "artist" | "performer" | "venue" | "sponsor" | "advertiser" | "admin" | "superadmin" | "owner";
};

function getRoleButton(role: TmiHomebookSectionButtonsProps["role"]): SectionButton {
  if (role === "fan") return { label: "Fan Hub", href: "/hub/fan", group: "role", color: "border-yellow-400/40 hover:border-yellow-300", textColor: "text-yellow-300" };
  if (role === "artist") return { label: "Artist Hub", href: "/hub/artist", group: "role", color: "border-violet-400/40 hover:border-violet-300", textColor: "text-violet-300" };
  if (role === "performer") return { label: "Performer Hub", href: "/hub/performer", group: "role", color: "border-indigo-400/40 hover:border-indigo-300", textColor: "text-indigo-300" };
  if (role === "venue") return { label: "Venue Hub", href: "/hub/venue", group: "role", color: "border-cyan-400/40 hover:border-cyan-300", textColor: "text-cyan-300" };
  if (role === "sponsor") return { label: "Sponsor Hub", href: "/hub/sponsor", group: "role", color: "border-fuchsia-400/40 hover:border-fuchsia-300", textColor: "text-fuchsia-300" };
  if (role === "advertiser") return { label: "Advertiser Hub", href: "/hub/advertiser", group: "role", color: "border-rose-400/40 hover:border-rose-300", textColor: "text-rose-300" };
  if (role === "admin" || role === "superadmin" || role === "owner") return { label: "Admin Hub", href: "/hub/admin", group: "role", color: "border-red-400/40 hover:border-red-300", textColor: "text-red-300" };
  return { label: "Dashboard", href: "/hub", group: "role", color: "border-cyan-400/40 hover:border-cyan-300", textColor: "text-cyan-300" };
}

export default function TmiHomebookSectionButtons({ className, isLoggedIn = false, role }: TmiHomebookSectionButtonsProps) {
  const pages = SECTION_BUTTONS.filter((item) => item.group === "page");
  const sections = SECTION_BUTTONS.filter((item) => item.group === "section");
  const roleButton = isLoggedIn ? getRoleButton(role) : null;

  return (
    <div className={["rounded-lg border border-white/15 bg-black/35 p-2", className ?? ""].join(" ")}>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {pages.map((page) => (
          <Link
            key={page.label}
            href={page.href}
            className={`rounded border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] transition ${page.color} bg-black/50 ${page.textColor} hover:bg-black/70`}
            title={page.label}
          >
            {page.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sections.map((section) => (
          <Link
            key={section.label}
            href={section.href}
            className={`rounded border px-2 py-1 text-[10px] font-black uppercase tracking-[0.11em] transition ${section.color} bg-black/50 ${section.textColor} hover:bg-black/70`}
            title={section.label}
          >
            {section.label}
          </Link>
        ))}
        {roleButton ? (
          <Link
            href={roleButton.href}
            className={`rounded border px-2 py-1 text-[10px] font-black uppercase tracking-[0.11em] transition ${roleButton.color} bg-black/50 ${roleButton.textColor} hover:bg-black/70`}
            title={roleButton.label}
          >
            {roleButton.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
