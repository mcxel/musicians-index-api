'use client';
import CanonicalHomePage012Artifact from '@/artifacts/homepages/HomePage012.artifact';
import { ensureHomeEconomyRuntime } from '@/lib/integration/EconomyIntegrationRuntime';
import { useEffect } from 'react';

export default function HomePage012Artifact() {
  useEffect(() => {
    ensureHomeEconomyRuntime('/home/1-2');
  }, []);

  return <CanonicalHomePage012Artifact />;
}
