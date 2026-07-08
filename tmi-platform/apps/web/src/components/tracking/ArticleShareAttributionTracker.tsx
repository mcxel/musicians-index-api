'use client';

import { useEffect, useRef, useState } from 'react';
import type { ArticleShareMode } from '@/lib/share/ArticleShareTrackingEngine';

interface Props {
  articleSlug: string;
  performerSlug: string;
}

const ENGAGED_READ_MS = 15000;
const ENGAGED_SCROLL_RATIO = 0.35;

function getModeFromParams(raw: string | null): ArticleShareMode {
  if (raw === 'motion' || raw === 'live' || raw === 'premiere') return raw;
  return 'still';
}

export default function ArticleShareAttributionTracker({ articleSlug, performerSlug }: Props) {
  const [thresholdReached, setThresholdReached] = useState(false);
  const engagedSentRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const source = params.get('utm_source') || 'direct';
    const article = params.get('article') || articleSlug;
    const mode = getModeFromParams(params.get('mode'));

    const openKey = `tmi:article:open:${article}:${window.location.pathname}:${window.location.search}`;
    if (!window.sessionStorage.getItem(openKey)) {
      window.sessionStorage.setItem(openKey, '1');
      void fetch('/api/referral/article-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'open',
          articleSlug,
          performerSlug,
          referrerId: ref || performerSlug,
          mode,
          source,
          platform: source,
        }),
      }).catch(() => undefined);
    }

    if (ref) {
      const clickKey = `tmi:article:click:${article}:${ref}`;
      if (!window.sessionStorage.getItem(clickKey)) {
        window.sessionStorage.setItem(clickKey, '1');
        void fetch('/api/referral/article-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'click',
            articleSlug,
            performerSlug,
            referrerId: ref,
            mode,
            source,
            platform: source,
          }),
        }).catch(() => undefined);
      }
    }
  }, [articleSlug, performerSlug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = window.scrollY / max;
      if (ratio >= ENGAGED_SCROLL_RATIO) {
        setThresholdReached(true);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!thresholdReached || engagedSentRef.current || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const source = params.get('utm_source') || 'direct';
    const mode = getModeFromParams(params.get('mode'));

    const timer = window.setTimeout(() => {
      if (engagedSentRef.current) return;
      engagedSentRef.current = true;
      void fetch('/api/referral/article-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'engaged_read',
          articleSlug,
          performerSlug,
          referrerId: ref || performerSlug,
          mode,
          source,
          platform: source,
        }),
      }).catch(() => undefined);
    }, ENGAGED_READ_MS);

    return () => window.clearTimeout(timer);
  }, [thresholdReached, articleSlug, performerSlug]);

  return null;
}
