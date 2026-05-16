import { useState } from 'react';

export const useUserSubscription = () => {
  // Mocking the tier state for 'free', 'pro', or 'gold'
  const [tier] = useState<'free' | 'pro' | 'gold'>('pro'); 
  
  return { tier };
};