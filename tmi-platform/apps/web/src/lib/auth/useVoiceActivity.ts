import { useState } from 'react';

export const useVoiceActivity = (userId: string) => {
  // Bound to global voice engine or webRTC audio track analyzer
  const [isSpeaking] = useState(false);
  return isSpeaking;
};