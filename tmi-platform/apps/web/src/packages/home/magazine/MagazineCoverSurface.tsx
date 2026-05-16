"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const COVER_HANDOFF_KEY = "tmi-magazine-cover-handoff";

export default function MagazineCoverSurface() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    router.prefetch("/home/1");
  }, [router]);

  const enterMagazine = useCallback(() => {
    if (isLeaving) return;
    setIsLeaving(true);
    window.sessionStorage.setItem(COVER_HANDOFF_KEY, "1");

    window.setTimeout(() => {
      router.push("/home/1");
    }, 320);
  }, [isLeaving, router]);

  return (
    <main className="mag-cover-surface" data-cover-state={isLeaving ? "leaving" : "ready"}>
      <div className="mag-cover-surface__bg" />

      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: isLeaving ? 0.08 : 1, scale: isLeaving ? 0.985 : 1 }}
        transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
        className="mag-cover-surface__content"
      >
        <div className="mag-cover-surface__pill">
          ISSUE 88
        </div>

        <div className="mag-cover-surface__grid">
          <section>
            <p className="mag-cover-surface__brand">The Musician&apos;s Index</p>
            <h1 className="mag-cover-surface__title">
              Who Took The Crown This Week?
            </h1>
            <p className="mag-cover-surface__copy">
              This is the loud cover surface. Enter to open the structured two-page spread with full cinematic routing.
            </p>

            <div className="mag-cover-surface__actions">
              <button
                onClick={enterMagazine}
                disabled={isLeaving}
                className="mag-cover-surface__cta"
              >
                Enter Magazine
              </button>
              <a
                href="/home/1"
                className="mag-cover-surface__skip"
              >
                Skip To Spread
              </a>
            </div>
          </section>

          <section className="mag-cover-surface__cards-wrap">
            <div className="mag-cover-surface__cards">
              <div className="mag-cover-surface__card">
                <p className="mag-cover-surface__card-rank">#1</p>
                <p className="mag-cover-surface__card-name">Ray Journey</p>
                <p className="mag-cover-surface__card-meta">Crown Winner</p>
              </div>
              <div className="mag-cover-surface__card">
                <p className="mag-cover-surface__card-rank">#2</p>
                <p className="mag-cover-surface__card-name">Nova Pulse</p>
                <p className="mag-cover-surface__card-meta">Top Challenger</p>
              </div>
              <div className="mag-cover-surface__card">
                <p className="mag-cover-surface__card-rank">#3</p>
                <p className="mag-cover-surface__card-name">Juno Arc</p>
                <p className="mag-cover-surface__card-meta">Cypher Heat</p>
              </div>
              <div className="mag-cover-surface__card">
                <p className="mag-cover-surface__card-rank">#4</p>
                <p className="mag-cover-surface__card-name">Kato Drift</p>
                <p className="mag-cover-surface__card-meta">Live Momentum</p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </main>
  );
}
