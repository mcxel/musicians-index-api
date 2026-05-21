import { useState, useCallback, useEffect } from 'react';

export const useTTS = (textToRead: string) => {
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    // Cleanup speech synthesis on unmount
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleTTS = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  }, [textToRead, isReading]);

  return { isReading, toggleTTS };
};