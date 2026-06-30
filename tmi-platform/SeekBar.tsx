"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";

interface SeekBarProps {
  duration: number;
  progress: number;
  onSeek: (time: number) => void;
}

export function SeekBar({ duration, progress, onSeek }: SeekBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const getSeekTimeFromEvent = useCallback(
    (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
      if (!progressBarRef.current || !duration) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clickX = clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, clickX / width));
      return percentage * duration;
    },
    [duration]
  );

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const newTime = getSeekTimeFromEvent(e);
      if (newTime !== null) {
        onSeek(newTime);
      }
    },
    [getSeekTimeFromEvent, onSeek]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        const newTime = getSeekTimeFromEvent(e);
        if (newTime !== null) {
          onSeek(newTime);
        }
      }
    },
    [isDragging, getSeekTimeFromEvent, onSeek]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      ref={progressBarRef}
      onClick={handleSeek}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      style={{
        flexGrow: 1,
        height: "4px",
        background: "#444",
        borderRadius: "2px",
        position: "relative",
        cursor: "pointer",
      }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={duration}
    >
      <div
        style={{
          position: "absolute",
          height: "100%",
          background: "#00FFFF",
          borderRadius: "2px",
          width: `${progressPercentage}%`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${progressPercentage}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "12px",
          height: "12px",
          background: "white",
          borderRadius: "50%",
          boxShadow: "0 0 8px rgba(0, 255, 255, 0.7)",
          opacity: isDragging ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
        className="seek-handle"
      />
    </div>
  );
}