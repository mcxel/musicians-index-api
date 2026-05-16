"use client";

/**
 * MagazinePromoMessageRotator
 *
 * Cycles through TMI promo messages with fade transitions.
 * Replaces static "Weekly Cyphers" text.
 * pointer-events: auto on the optional CTA link.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

export const TMI_PROMO_MESSAGES = [
  { text: "Who took the crown this week?", route: "/magazine/issues/current", category: "crown" },
  { text: "This week on The Musician's Index", route: "/magazine/issues/current", category: "magazine" },
  { text: "Trumpet vs Trumpet battle night", route: "/battles/current", category: "battle" },
  { text: "Guitar vs Guitar showcase", route: "/battles/showcase", category: "battle" },
  { text: "Comedy Night: comedians on the rise", route: "/shows/comedy", category: "comedy" },
  { text: "World Dance Party", route: "/shows/dance", category: "dance" },
  { text: "Watch your favorite streamer talk live", route: "/live", category: "live" },
  { text: "Artist talk show premiere", route: "/shows/talk", category: "talk" },
  { text: "Battle of the Bands", route: "/battles/bands", category: "battle" },
  { text: "Late Night Cypher Room", route: "/cypher", category: "cypher" },
  { text: "Join The Musician's Index Magazine", route: "/signup", category: "magazine" },
  { text: "Read, vote, watch, win", route: "/magazine", category: "magazine" },
  { text: "Weekly Cyphers — Artists Compete Live", route: "/cypher/weekly", category: "cypher" },
  { text: "News: Top 10 Ranking Update", route: "/magazine/news", category: "news" },
  { text: "Live Interview: Catch the show", route: "/shows/interviews", category: "interview" },
  { text: "Performer Showcase — All genres", route: "/shows/showcase", category: "showcase" },
] as const;

export type PromoCategoryIcon = {
  crown: string;
  magazine: string;
  battle: string;
  comedy: string;
  dance: string;
  live: string;
  talk: string;
  cypher: string;
  news: string;
  interview: string;
  showcase: string;
};

const CATEGORY_ICON: Record<string, string> = {
  crown: "👑",
  magazine: "📖",
  battle: "⚔️",
  comedy: "🎭",
  dance: "🕺",
  live: "🔴",
  talk: "🎙️",
  cypher: "🎤",
  news: "📰",
  interview: "🎬",
  showcase: "🌟",
};

export type MagazinePromoMessageRotatorProps = {
  intervalMs?: number;
  showIcon?: boolean;
  showRoute?: boolean;
  variant?: "strip" | "badge" | "overlay";
  "data-testid"?: string;
};

export default function MagazinePromoMessageRotator({
  intervalMs = 4000,
  showIcon = true,
  showRoute = true,
  variant = "strip",
  "data-testid": testId,
}: MagazinePromoMessageRotatorProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      // Fade out
      setVisible(false);
      const swapTimer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % TMI_PROMO_MESSAGES.length);
        setVisible(true);
      }, 350);
      return () => clearTimeout(swapTimer);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  const msg = TMI_PROMO_MESSAGES[index];
  const icon = CATEGORY_ICON[msg.category] ?? "✨";

  const textEl = (
    <span className="promo-rotator__text">
      {showIcon && <span className="promo-rotator__icon" aria-hidden>{icon} </span>}
      {msg.text}
    </span>
  );

  return (
    <div
      className={`promo-rotator promo-rotator--${variant}`}
      data-testid={testId ?? "promo-message-rotator"}
      data-category={msg.category}
    >
      <div
        className="promo-rotator__inner"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      >
        {showRoute ? (
          <Link
            href={msg.route}
            className="promo-rotator__link"
            data-testid="promo-message-link"
          >
            {textEl}
          </Link>
        ) : (
          textEl
        )}
      </div>
    </div>
  );
}
