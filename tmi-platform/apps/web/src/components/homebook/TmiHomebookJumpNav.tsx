"use client";

import Link from "next/link";
import React from "react";

type TopNavItem = {
  label: string;
  href: string;
  tone: string;
};

const TOP_NAV_ITEMS: TopNavItem[] = [
  { label: "Enter Magazine", href: "/home/1", tone: "border-cyan-300/40 text-cyan-100 hover:border-cyan-200" },
  { label: "Charts", href: "/charts", tone: "border-fuchsia-300/40 text-fuchsia-100 hover:border-fuchsia-200" },
  { label: "Cypher", href: "/cypher", tone: "border-emerald-300/40 text-emerald-100 hover:border-emerald-200" },
  { label: "Live World", href: "/home/3", tone: "border-emerald-300/40 text-emerald-100 hover:border-emerald-200" },
  { label: "Marketplace", href: "/home/5", tone: "border-fuchsia-300/40 text-fuchsia-100 hover:border-fuchsia-200" },
  { label: "About Us", href: "/articles", tone: "border-zinc-400/40 text-zinc-200 hover:border-zinc-200" },
];

type TmiHomebookJumpNavProps = {
  className?: string;
};

export default function TmiHomebookJumpNav({ className }: TmiHomebookJumpNavProps) {
  return (
    <nav className={["flex flex-wrap items-center justify-center gap-2", className ?? ""].join(" ")}>
      {TOP_NAV_ITEMS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={[
            "rounded-md border bg-black/35 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition",
            item.tone,
          ].join(" ")}
          title={item.label}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
