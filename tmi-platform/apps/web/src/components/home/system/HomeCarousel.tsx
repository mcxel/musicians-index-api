'use client';

import { isValidElement, type ReactNode, useEffect, useMemo, useState } from 'react';
import motionStyles from '@/styles/home/motion.module.css';

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

interface HomeCarouselProps {
  slides: ReactNode[];
  className?: string;
  autoPlay?: boolean;
  intervalMs?: number;
}

/**
 * HomeCarousel — lightweight auto-rotating panel carousel.
 * Used for sponsor banners, promo stacks, and showcase strips.
 */
export default function HomeCarousel({
  slides,
  className,
  autoPlay = true,
  intervalMs = 3600,
}: Readonly<HomeCarouselProps>) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoPlay, intervalMs, count]);

  const safeSlides = useMemo(() => (count > 0 ? slides : [<span key="empty">No Slides</span>]), [count, slides]);
  const dotKeys = useMemo(
    () =>
      safeSlides.map((slide, idx) => {
        if (isValidElement(slide) && slide.key != null) {
          return String(slide.key);
        }
        return `slide-dot-${idx + 1}`;
      }),
    [safeSlides],
  );

  return (
    <div className={cn(motionStyles.carouselShell, className)}>
      <div className={cn(motionStyles.carouselFade, motionStyles.carouselViewport)}>
        {safeSlides[index % safeSlides.length]}
      </div>
      {safeSlides.length > 1 && (
        <div className={motionStyles.carouselDots}>
          {safeSlides.map((_, i) => (
            <button
              key={dotKeys[i]}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(motionStyles.carouselDot, i === index && motionStyles.carouselDotActive)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
