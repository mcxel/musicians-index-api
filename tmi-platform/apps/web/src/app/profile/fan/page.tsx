'use client';

import HeadquartersV2Preview from '@/components/preview/HeadquartersV2Preview';

// HQ V2 is the canonical Fan Runtime — the legacy stats/quick-actions/upgrade-CTA
// fan profile has been retired in favor of this unified experience.
export default function FanProfilePage() {
  return <HeadquartersV2Preview role="fan" />;
}
