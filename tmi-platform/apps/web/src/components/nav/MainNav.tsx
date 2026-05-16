"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";
import UserAvatar from "@/components/user/UserAvatar";

type SessionRole = "fan" | "artist" | "performer" | "venue" | "sponsor" | "advertiser" | "admin" | "superadmin" | "owner";

type SessionPayload = {
  authenticated: boolean;
  role: SessionRole | null;
  user: { email: string; image?: string } | null;
};

const primaryLinks = [
  { href: routes.home, label: "Enter Magazine" },
  { href: routes.charts, label: "Charts" },
  { href: routes.cypher, label: "Cypher" },
  { href: routes.live("world"), label: "Live World" },
  { href: routes.store, label: "Marketplace" },
  { href: "/articles", label: "About Us" },
];

const HOMEPAGE_CANON_ROUTE_PATTERN = /^\/home\/(1|1-2|2|3|4|4-5|5|final)\/?$/;

function getRoleHub(role: SessionRole | null) {
  if (role === "fan") return { href: routes.fanHub, label: "Fan Hub" };
  if (role === "artist") return { href: routes.artistHub, label: "Artist Hub" };
  if (role === "performer") return { href: routes.performerHub, label: "Performer Hub" };
  if (role === "venue") return { href: "/hub/venue", label: "Venue Hub" };
  if (role === "sponsor") return { href: "/hub/sponsor", label: "Sponsor Hub" };
  if (role === "advertiser") return { href: "/hub/advertiser", label: "Advertiser Hub" };
  if (role === "admin" || role === "superadmin" || role === "owner") return { href: "/hub/admin", label: "Admin Hub" };
  return { href: routes.hub, label: "Dashboard" };
}

export default function MainNav() {
  const pathname = usePathname() ?? "";
  const [session, setSession] = useState<SessionPayload>({ authenticated: false, role: null, user: null });
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const isHomepageCanonRoute = useMemo(() => {
    const normalized = pathname ? pathname.replace(/\/+$/, "") : "";
    return HOMEPAGE_CANON_ROUTE_PATTERN.test(normalized);
  }, [pathname]);

  useEffect(() => {
    let active = true;

    if (isHomepageCanonRoute) {
      console.info("[MainNav] homepage route using guest session fallback");
      setSession({ authenticated: false, role: null, user: null });
      return () => {
        active = false;
      };
    }

    async function loadSession() {
      try {
        console.info("[MainNav] session fetch start");
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
        if (!res.ok) {
          console.warn("[MainNav] session fetch fallback", res.status);
          if (!active) return;
          setSession({ authenticated: false, role: null, user: null });
          return;
        }
        const data = (await res.json()) as {
          authenticated?: boolean;
          role?: string | null;
          user?: { email?: string; image?: string } | null;
        };
        if (!active) return;
        setSession({
          authenticated: Boolean(data?.authenticated),
          role: (typeof data?.role === "string" ? data.role : null) as SessionRole | null,
          user: data?.user?.email
            ? { email: data.user.email, image: data.user.image }
            : null,
        });
      } catch {
        if (!active) return;
        setSession({ authenticated: false, role: null, user: null });
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, [isHomepageCanonRoute]);

  const roleHub = useMemo(() => getRoleHub(session.role), [session.role]);

  const initials = useMemo(() => {
    const email = session.user?.email;
    if (!email) return "TM";
    return email.slice(0, 2).toUpperCase();
  }, [session.user?.email]);

  async function handleShare() {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "The Musician's Index",
          text: "Step into the live magazine.",
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1800);
    } catch {
      setShareState("idle");
    }
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-cyan-400/20 bg-black/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-3 text-white sm:px-6">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <Link href={routes.home} className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
            TMI
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/78 sm:gap-4">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-cyan-300">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {session.authenticated ? (
            isHomepageCanonRoute ? (
              <Link href={routes.hub} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 transition hover:border-cyan-300/40 hover:bg-white/10">
                <UserAvatar initials={initials} imageUrl={session.user?.image} />
              </Link>
            ) : (
              <>
                <Link href={routes.notifications} className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/78 transition hover:border-cyan-300/40 hover:text-cyan-200">
                  Alerts
                </Link>
                <Link href={routes.messages} className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/78 transition hover:border-cyan-300/40 hover:text-cyan-200">
                  Messages
                </Link>
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded-full border border-fuchsia-400/30 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-fuchsia-100 transition hover:border-fuchsia-300/50 hover:text-white"
                >
                  {shareState === "copied" ? "Link Copied" : "Share"}
                </button>
                <Link href={roleHub.href} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-200/60">
                  {roleHub.label}
                </Link>
                <Link href={routes.hub} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 transition hover:border-cyan-300/40 hover:bg-white/10">
                  <UserAvatar initials={initials} imageUrl={session.user?.image} />
                </Link>
              </>
            )
          ) : (
            <>
              <Link href={routes.login} className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/78 transition hover:border-cyan-300/40 hover:text-cyan-200">
                Login
              </Link>
              <Link href={routes.signup} className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-400/20">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
