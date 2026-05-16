"use client";
import { useState } from 'react';

export function useVoiceActivity(_userId: string): boolean {
  const [isSpeaking] = useState(false);
  return isSpeaking;
}
