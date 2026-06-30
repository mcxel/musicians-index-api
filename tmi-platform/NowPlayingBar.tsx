"use client";

// This would come from a global state management library (e.g., Zustand, Jotai)
// import { usePlaylistStore } from '@/stores/playlistStore';

/**
 * A global component that shows the currently playing media item.
 * It would be placed in the root layout of the application.
 */
export function NowPlayingBar() {
  // const { currentItem, isPlaying, progress } = usePlaylistStore();
  const currentItem = null; // Placeholder

  if (!currentItem) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "rgba(20, 20, 30, 0.9)",
        backdropFilter: "blur(10px)",
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        zIndex: 1000,
      }}
    >
      {/*
        This would contain:
        - Album art / thumbnail
        - Song/video title and artist
        - Play/Pause, Next/Prev controls
        - Progress bar
      */}
      <p>Now Playing: {currentItem.title}</p>
    </div>
  );
}