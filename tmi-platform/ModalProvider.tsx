"use client";

import { useWindowRuntime } from "@/lib/runtime/window/WindowRuntimeHook"; // Assuming a hook exists
import { UniversalActionMenuWithStyles } from "@/components/media/UniversalActionMenu";

/**
 * Renders windows that are in a 'modal' presentation state, managed by the UniversalWindowRuntime.
 * This component listens to the window runtime and displays modal content.
 * This replaces the need for a separate modalStore.
 */
export function ModalProvider() {
  // This is a conceptual implementation of how it would work.
  // The actual hook might be named differently (e.g., useWindowManager).
  const { windows, setWindowState } = useWindowRuntime();

  const modalWindow = Object.values(windows).find(
    (win) => win.presentation === "modal" && win.state !== "hidden"
  );

  if (!modalWindow) return null;

  const handleClose = () => {
    // We dispatch an action to the runtime to hide the window.
    // The runtime handles the state change.
    setWindowState(modalWindow.id, { state: "hidden" });
  };

  // Render the correct modal based on its ID or content type
  if (modalWindow.id === "universal-action-menu" && modalWindow.payload?.mediaItem) {
    return <UniversalActionMenuWithStyles mediaItem={modalWindow.payload.mediaItem} onClose={handleClose} />;
  }

  return null;
}