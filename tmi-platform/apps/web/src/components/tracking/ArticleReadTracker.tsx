'use client';
import { useEffect } from 'react';
import { useGamificationEngine } from '@/hooks/useGamificationEngine';

export default function ArticleReadTracker() {
  const { trackAction } = useGamificationEngine();
  useEffect(() => {
    trackAction('READ_ARTICLE');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
