"use client";

import { useEffect, useMemo, useState } from "react";
import MagazineShell, { type MagazinePage } from "@/components/magazine/MagazineShell";
import { readMagazinePosition, writeMagazinePosition } from "@/components/magazine/MagazinePositionStorage";
import {
  MAGAZINE_DEFAULT_START_PAGE,
  resolveMagazineReaderPageIndex,
} from "@/lib/magazine/MagazineReaderRoutes";

type MagazineIssueReaderProps = {
  issue: string;
  displayIssue?: string;
  issueTitle: string;
  pages: MagazinePage[];
  initialArticleSlug?: string;
  initialPageIndex?: number;
  returnTo?: string;
};

export default function MagazineIssueReader({
  issue,
  displayIssue,
  issueTitle,
  pages,
  initialArticleSlug,
  initialPageIndex,
  returnTo,
}: MagazineIssueReaderProps) {
  const [initialLeftIndex, setInitialLeftIndex] = useState(
    initialPageIndex ?? MAGAZINE_DEFAULT_START_PAGE,
  );

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

    if (initialArticleSlug) {
      setInitialLeftIndex(resolveMagazineReaderPageIndex(initialArticleSlug, undefined, issue));
      return;
    }

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

  const title = useMemo(() => issueTitle || "The Musician's Index", [issueTitle]);

  return (
    <MagazineShell
      pages={pages}
      issue={displayIssue ?? issue}
      issueTitle={title}
      initialLeftIndex={initialLeftIndex}
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
  );
}
