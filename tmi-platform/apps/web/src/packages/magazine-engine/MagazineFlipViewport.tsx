"use client";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { getCurrentIssue, useMagazinePager } from "./useMagazinePager";

const COVER_HANDOFF_KEY = "tmi-magazine-cover-handoff";

type Props = {
  children: ReactNode;
};

export default function MagazineFlipViewport({ children }: Props) {
  const { pages, currentPage, currentIndex, direction, isFlipping, next, prev, canNext, canPrev } = useMagazinePager();
  const issue = getCurrentIssue(currentPage.id) ?? currentPage;
  const controls = useAnimation();
  const [shouldAnimateInitial] = useState(() => {
    if (typeof window === "undefined") return false;
    const hasHandoff = window.sessionStorage.getItem(COVER_HANDOFF_KEY) === "1";
    if (hasHandoff) {
      window.sessionStorage.removeItem(COVER_HANDOFF_KEY);
    }
    return hasHandoff;
  });

  const leftPage = pages[currentIndex - 1];
  const rightPage = pages[currentIndex + 1];

  useEffect(() => {
    controls.start({
      opacity: 1,
      rotateY: 0,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: isFlipping ? 1.08 : 0.95,
      },
    });
  }, [controls, currentIndex, isFlipping]);

  return (
    <div className="mag-flip-viewport" data-magazine-route={currentPage.route} data-issue-slug={issue.slug} data-theme={issue.theme}>
      {leftPage && (
        <div className="mag-flip-ghost mag-flip-ghost--left" aria-hidden>
          <p className="mag-flip-ghost__label">Previous</p>
          <p className="mag-flip-ghost__title">{leftPage.title}</p>
        </div>
      )}

      {rightPage && (
        <div className="mag-flip-ghost mag-flip-ghost--right" aria-hidden>
          <p className="mag-flip-ghost__label">Next</p>
          <p className="mag-flip-ghost__title">{rightPage.title}</p>
        </div>
      )}

      <AnimatePresence mode="wait" initial={shouldAnimateInitial}>
        <motion.div
          key={`${currentPage.route}-${currentIndex}`}
          drag="x"
          dragConstraints={{ left: -300, right: 300 }}
          dragElastic={0.16}
          onDragEnd={async (_, info) => {
            if (info.offset.x < -120 && canNext) {
              next();
              return;
            }

            if (info.offset.x > 120 && canPrev) {
              prev();
              return;
            }

            await controls.start({ x: 0, rotateY: 0, transition: { type: "spring", stiffness: 240, damping: 24 } });
          }}
          animate={controls}
          initial={{
            opacity: shouldAnimateInitial ? 0.4 : 0.7,
            rotateY: shouldAnimateInitial ? -10 : direction > 0 ? -14 : 14,
            x: shouldAnimateInitial ? 36 : direction > 0 ? 80 : -80,
            scale: shouldAnimateInitial ? 0.975 : 0.985,
          }}
          exit={{
            opacity: 0.55,
            rotateY: direction > 0 ? 12 : -12,
            x: direction > 0 ? -60 : 60,
            scale: 0.985,
          }}
          style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
          className="mag-flip-page w-full h-full will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
