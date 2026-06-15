'use client';

import React, { useState } from 'react';

interface PolaroidCaptureButtonProps {
  userId: string;
  eventId: string;
  onCaptureSuccess?: () => void;
}

export default function PolaroidCaptureButton({ userId, eventId, onCaptureSuccess }: PolaroidCaptureButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      await fetch('/api/memory/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          imageData: '/tmi-source/placeholders/memory-capture.jpg',
          captureType: 'group_photo',
          eventId,
          roomLabel: 'Legendary Drop Captured!',
        }),
      });
      if (onCaptureSuccess) onCaptureSuccess();
    } catch (error) {
      console.error('[CAPTURE_ERR] Failed to capture moment', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <button 
      onClick={handleCapture}
      disabled={isCapturing}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
        backgroundColor: isCapturing ? '#333' : 'var(--cyan, #00E5FF)',
        color: isCapturing ? '#888' : '#000', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '24px', fontWeight: 900, cursor: isCapturing ? 'wait' : 'pointer',
        fontFamily: 'var(--font-orbitron)', transition: 'all 0.2s ease',
        boxShadow: isCapturing ? 'none' : '0 0 10px rgba(0, 229, 255, 0.4)'
      }}
    >
      {isCapturing ? '📸 PROCESSING...' : '📸 CAPTURE MOMENT'}
    </button>
  );
}