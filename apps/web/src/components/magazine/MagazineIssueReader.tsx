"use client";

import { useEffect, useMemo, useState } from "react";
import MagazineShell, { type MagazinePage } from "@/components/magazine/MagazineShell";
import { readMagazinePosition, writeMagazinePosition } from "@/components/magazine/MagazinePositionStorage";
import { MAGAZINE_DEFAULT_START_PAGE } from "@/lib/magazine/MagazineReaderRoutes";
import { firstUnseenIndex, markMagazineSpreadSeen, readMagazineSeen } from "@/lib/profile/profileDiscoveryHistory";

type MagazineIssueReaderProps = {
  issue: string;
  displayIssue?: string;
  issueTitle: string;
  pages: MagazinePage[];
  initialArticleSlug?: string;
  initialPageIndex?: number;
  returnTo?: string;
  preferUnseen?: boolean;
};

export default function MagazineIssueReader({
  issue,
  displayIssue,
  issueTitle,
  pages,
  initialArticleSlug,
  initialPageIndex,
  returnTo,
  preferUnseen = false,
}: MagazineIssueReaderProps) {
  const [initialLeftIndex, setInitialLeftIndex] = useState(
    initialPageIndex ?? MAGAZINE_DEFAULT_START_PAGE,
  );
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [caughtUp, setCaughtUp] = useState(false);

  useEffect(() => {
    if (returnTo && returnTo.startsWith("/")) {
      sessionStorage.setItem("tmi_magazine_origin", returnTo);
    }
  }, [returnTo]);

  useEffect(() => {
    if (initialPageIndex !== undefined) {
      setInitialLeftIndex(initialPageIndex);
      return;
    }

    // Page-index resolution now requires an async Prisma-backed lookup
    // (contributor-submission articles), so it can only run server-side —
    // every real caller already resolves and passes initialPageIndex
    // alongside initialArticleSlug (see /magazine/issue/current/page.tsx).
    // This branch stays as the honest fallback for the no-slug case only.

    const saved = readMagazinePosition();
    if (!saved || saved.lastIssue !== issue) {
      setInitialLeftIndex(MAGAZINE_DEFAULT_START_PAGE);
      return;
    }

    setInitialLeftIndex(saved.lastPage);

    if (saved.lastScrollX > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ left: saved.lastScrollX, top: 0, behavior: "auto" });
      });
    }
  }, [issue, initialArticleSlug, initialPageIndex]);

  useEffect(() => {
    if (!preferUnseen || initialArticleSlug) return;
    let cancelled = false;
    void fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data: { authenticated?: boolean; user?: { id?: string } }) => {
        if (cancelled || !data.authenticated || !data.user?.id) return;
        setViewerId(data.user.id);
        const unseen = firstUnseenIndex(pages, readMagazineSeen(data.user.id));
        if (unseen == null) setCaughtUp(true);
        else setInitialLeftIndex(unseen);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [preferUnseen, initialArticleSlug, pages]);

  useEffect(() => {
    if (!preferUnseen || !viewerId) return;
    const spreadId = pages[initialLeftIndex]?.id;
    if (!spreadId) return;
    let remaining = 3000;
    let started = document.visibilityState === "visible" ? Date.now() : 0;
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && started) {
        remaining -= Date.now() - started;
        started = 0;
      } else if (document.visibilityState === "visible" && !started) started = Date.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => {
      if (started && remaining - (Date.now() - started) <= 0) {
        markMagazineSpreadSeen(viewerId, spreadId);
        window.clearInterval(timer);
      }
    }, 200);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, [preferUnseen, viewerId, initialLeftIndex, pages]);

  const title = useMemo(() => issueTitle || "The Musician's Index", [issueTitle]);

  return (
    <>
      {caughtUp ? (
        <p data-testid="magazine-caught-up" style={{ margin: 0, padding: "8px 16px", color: "#f4f1ff", background: "#140018", fontSize: 12 }}>
          You have seen the spreads in this issue. Continuing from the start.
        </p>
      ) : null}
      <MagazineShell
      pages={pages}
      issue={displayIssue ?? issue}
      issueTitle={title}
      initialLeftIndex={initialLeftIndex}
      initialArticleSlug={initialArticleSlug}
      onPageChange={(_, index) => {
        const spread = index <= 0 ? 0 : Math.floor((index + 1) / 2);
        writeMagazinePosition({
          lastIssue: issue,
          lastSpread: spread,
          lastPage: index,
          lastScrollX: typeof window !== "undefined" ? window.scrollX : 0,
          timestamp: Date.now(),
        });
      }}
    />
    </>
  );
}
