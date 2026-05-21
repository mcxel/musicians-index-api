import { useCallback } from 'react';

export const useMagazineEconomy = (userId: string, articleId: string) => {
  /**
   * Awards points for interacting with the magazine (read, flip, share)
   * Endpoint: POST /api/points/earn
   */
  const triggerRewardLoop = useCallback(async (action: 'read' | 'share' | 'flip', metadata?: any) => {
    try {
      const response = await fetch('/api/economy/earn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          sourceId: articleId, 
          sourceType: 'MAGAZINE_ARTICLE',
          action,
          metadata 
        })
      });
      
      if (!response.ok) throw new Error('Economy hook failed');
      return await response.json();
    } catch (error) {
      console.error('[Magazine Economy] Sync Error:', error);
    }
  }, [userId, articleId]);

  return { triggerRewardLoop };
};