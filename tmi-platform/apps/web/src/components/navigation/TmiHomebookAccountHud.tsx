"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AccountCommandMenu from "./AccountCommandMenu";

interface TmiHomebookAccountHudProps {
  isLoggedIn?: boolean;
}

export default function TmiHomebookAccountHud({ isLoggedIn: isLoggedInProp }: TmiHomebookAccountHudProps) {
  const [session, setSession] = useState<{
    authenticated: boolean;
    user?: { id?: string; name?: string; avatarUrl?: string | null };
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((data) => {
        if (active) setSession(data);
      })
      .catch(() => {
        if (active) setSession({ authenticated: false });
      });
    return () => {
      active = false;
    };
  }, []);

  const isLoggedIn = isLoggedInProp ?? session?.authenticated === true;
  const userId = session?.user?.id ?? "guest";
  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.id?.slice(0, 8) ||
    "Account";
  const avatarUrl = session?.user?.avatarUrl ?? null;

  return (
    <div className="flex items-center gap-4 border border-white/10 bg-black/60 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.8)] pointer-events-auto">
      {!isLoggedIn ? (
        <>
          <Link href="/signup" className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-300 hover:text-cyan-100 transition-all hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
            Sign Up
          </Link>
          <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.15em] text-fuchsia-300 hover:text-fuchsia-100 transition-all hover:drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">
            Log In
          </Link>
        </>
      ) : null}
      <div className="h-5 w-px bg-white/20" />
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 border border-white/10 text-[9px] shadow-inner hover:bg-zinc-700 transition-colors"
        aria-label="Toggle Region"
      >
        US
      </button>
      {isLoggedIn ? (
        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-500 p-[2px] shadow-[0_0_15px_rgba(217,70,239,0.4)]">
          <AccountCommandMenu
            userId={userId}
            displayName={displayName}
            avatarUrl={avatarUrl}
            accentColor="#00FFFF"
            compact
          />
        </div>
      ) : (
        <Link
          href="/login"
          className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-500 p-[2px] hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(217,70,239,0.4)]"
          aria-label="Log in"
        >
          <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-[8px] font-black tracking-tighter text-white">
            TMI
          </div>
        </Link>
      )}
    </div>
  );
}