"use client";

import Link from "next/link";
import React, { useState } from "react";

interface TmiHomebookAccountHudProps {
  isLoggedIn?: boolean;
  role?: "fan" | "artist" | "performer" | "venue" | "sponsor" | "advertiser" | "admin" | "superadmin" | "owner";
  userName?: string;
  userInitials?: string;
  worldFlag?: string;
  onWorldFlagToggle?: () => void;
}

function getRoleHub(role: TmiHomebookAccountHudProps["role"]) {
  if (role === "fan") return { href: "/hub/fan", label: "Fan Hub" };
  if (role === "artist") return { href: "/hub/artist", label: "Artist Hub" };
  if (role === "performer") return { href: "/hub/performer", label: "Performer Hub" };
  if (role === "venue") return { href: "/hub/venue", label: "Venue Hub" };
  if (role === "sponsor") return { href: "/hub/sponsor", label: "Sponsor Hub" };
  if (role === "advertiser") return { href: "/hub/advertiser", label: "Advertiser Hub" };
  if (role === "admin" || role === "superadmin" || role === "owner") return { href: "/hub/admin", label: "Admin Hub" };
  return { href: "/hub", label: "Dashboard" };
}

export default function TmiHomebookAccountHud({
  isLoggedIn = false,
  role,
  userName = "Guest",
  userInitials = "GU",
  worldFlag = "🌍",
  onWorldFlagToggle,
}: TmiHomebookAccountHudProps) {
  const [showWorldFlag, setShowWorldFlag] = useState(false);
  const roleHub = getRoleHub(role);

  const handleToggleWorldFlag = () => {
    setShowWorldFlag(!showWorldFlag);
    onWorldFlagToggle?.();
  };

  return (
    <div className="flex items-center gap-2 rounded-md border border-cyan-300/30 bg-black/45 px-2 py-1.5">
      <Link
        href={isLoggedIn ? "/hub" : "/signup"}
        title={userName}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/55 bg-gradient-to-br from-fuchsia-500/35 to-cyan-500/35 text-xs font-black uppercase tracking-[0.08em] text-cyan-100 transition hover:border-cyan-200"
      >
        {userInitials}
      </Link>
      <button
        onClick={handleToggleWorldFlag}
        className="rounded border border-emerald-400/35 bg-black/30 px-2 py-1 text-sm transition hover:border-emerald-200 hover:bg-black/60"
        title="Toggle world environment"
      >
        {showWorldFlag ? worldFlag : "🌐"}
      </button>

      {isLoggedIn ? (
        <>
          <Link
            href="/notifications"
            className="rounded border border-white/40 bg-black/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-200"
          >
            Alerts
          </Link>
          <Link
            href="/messages"
            className="rounded border border-white/40 bg-black/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-200"
          >
            Messages
          </Link>
          <Link
            href="/profile"
            className="rounded border border-fuchsia-300/45 bg-black/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200"
          >
            Share
          </Link>
          <Link
            href={roleHub.href}
            className="rounded border border-cyan-300/45 bg-black/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200"
          >
            {roleHub.label}
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/signup"
            className="rounded border border-fuchsia-300/45 bg-black/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200"
          >
            Sign Up
          </Link>
          <Link
            href="/auth"
            className="rounded border border-cyan-300/45 bg-black/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200"
          >
            Login
          </Link>
        </>
      )}
    </div>
  );
}
