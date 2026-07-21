'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FlexStoreShowroom from '@/components/store/FlexStoreShowroom';

function FlexStorePageContent() {
  const searchParams = useSearchParams();
  const wing = (searchParams?.get('wing') ?? 'apparel') as any;
  const trackId = searchParams?.get('trackId') ?? undefined;

  return <FlexStoreShowroom initialWing={wing} initialTrackId={trackId} />;
}

export default function FlexStorePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#fff', textAlign: 'center' }}>Loading 3D Flex Store Showroom...</div>}>
      <FlexStorePageContent />
    </Suspense>
  );
}
