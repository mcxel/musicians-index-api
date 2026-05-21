import { useEffect, useRef } from 'react';

export const useSponsorAnalytics = (sponsorId: string, placementId: string) => {
  const sponsorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Fire impression once per mount
        fetch('/api/analytics/sponsor/impression', {
          method: 'POST',
          body: JSON.stringify({ sponsorId, placementId, timestamp: Date.now() })
        }).catch(() => {});
        observer.disconnect();
      }
    }, { threshold: 0.6 }); // 60% visibility required for impression

    if (sponsorRef.current) observer.observe(sponsorRef.current);
    return () => observer.disconnect();
  }, [sponsorId, placementId]);

  const trackClickThrough = () => {
    fetch('/api/analytics/sponsor/click', {
      method: 'POST',
      body: JSON.stringify({ sponsorId, placementId, timestamp: Date.now() })
    }).catch(() => {});
  };

  return { sponsorRef, trackClickThrough };
};