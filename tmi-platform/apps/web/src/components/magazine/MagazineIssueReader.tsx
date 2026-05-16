"use client";

import { useEffect, useMemo, useState } from "react";
import MagazineShell, { type MagazinePage } from "@/components/magazine/MagazineShell";
import { readMagazinePosition, writeMagazinePosition } from "@/components/magazine/MagazinePositionStorage";

type MagazineIssueReaderProps = {
  issue: string;
  displayIssue?: string;
  issueTitle: string;
  pages: MagazinePage[];
};

export default function MagazineIssueReader({ issue, displayIssue, issueTitle, pages }: MagazineIssueReaderProps) {
  const [initialLeftIndex, setInitialLeftIndex] = useState(0);

  useEffect(() => {
    const saved = readMagazinePosition();
    if (!saved) return;
    if (saved.lastIssue !== issue) return;
    setInitialLeftIndex(saved.lastPage);

    if (saved.lastScrollX > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ left: saved.lastScrollX, top: 0, behavior: "auto" });
      });
    }
  }, [issue]);

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
