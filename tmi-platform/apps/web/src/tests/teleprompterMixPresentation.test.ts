import { useTeleprompterStore } from "../lib/teleprompter/teleprompterStore";

describe("Teleprompter & MIX Presentation Architecture Certification", () => {
  beforeEach(() => {
    useTeleprompterStore.setState({
      script: "TEST SCRIPT FOR LIVE STAGE",
      isPlaying: false,
      speed: 1,
      textSize: 24,
      scrollTop: 0,
      presentationMode: "OFF",
      isMirrored: false,
      targetMonitor: "b",
      isPadOpen: false,
      overlayOpacity: 0.65,
      readingWidthPercent: 85,
      overlayPosition: "center",
    });
  });

  it("MIX_TELEPROMPTER_SOURCE_PRESENT: supports all canonical presentations under one store", () => {
    const store = useTeleprompterStore.getState();
    expect(store.presentationMode).toBe("OFF");

    // PAD Mode
    store.setPresentationMode("PAD");
    expect(useTeleprompterStore.getState().presentationMode).toBe("PAD");
    expect(useTeleprompterStore.getState().isPadOpen).toBe(true);

    // WORDS ONLY Mode
    store.setPresentationMode("WORDS_ONLY");
    expect(useTeleprompterStore.getState().presentationMode).toBe("WORDS_ONLY");

    // OVERLAY Mode (defaults target to Monitor A)
    store.setPresentationMode("OVERLAY");
    expect(useTeleprompterStore.getState().presentationMode).toBe("OVERLAY");
    expect(useTeleprompterStore.getState().targetMonitor).toBe("a");

    // FULLSCREEN Mode
    store.setPresentationMode("FULLSCREEN");
    expect(useTeleprompterStore.getState().presentationMode).toBe("FULLSCREEN");
  });

  it("SAME_SCRIPT_AUTHORITY_FOR_ALL_MODES: preserves script across all mode transitions", () => {
    const store = useTeleprompterStore.getState();
    const customScript = "LYRICS: VERSE 1 - LINE 1\nLINE 2\nCHORUS";
    store.setScript(customScript);

    // Switch through PAD -> WORDS_ONLY -> OVERLAY -> FULLSCREEN -> OFF
    store.setPresentationMode("PAD");
    expect(useTeleprompterStore.getState().script).toBe(customScript);

    store.setPresentationMode("WORDS_ONLY");
    expect(useTeleprompterStore.getState().script).toBe(customScript);

    store.setPresentationMode("OVERLAY");
    expect(useTeleprompterStore.getState().script).toBe(customScript);

    store.setPresentationMode("FULLSCREEN");
    expect(useTeleprompterStore.getState().script).toBe(customScript);

    store.setPresentationMode("OFF");
    expect(useTeleprompterStore.getState().script).toBe(customScript);
  });

  it("SCRIPT_POSITION_PRESERVED_BETWEEN_MODES: preserves scroll position across mode transitions", () => {
    const store = useTeleprompterStore.getState();
    store.setScrollTop(340);
    expect(useTeleprompterStore.getState().scrollTop).toBe(340);

    store.setPresentationMode("WORDS_ONLY");
    expect(useTeleprompterStore.getState().scrollTop).toBe(340);

    store.setPresentationMode("OVERLAY");
    expect(useTeleprompterStore.getState().scrollTop).toBe(340);

    store.setPresentationMode("FULLSCREEN");
    expect(useTeleprompterStore.getState().scrollTop).toBe(340);
  });

  it("PLAY_STATE_PRESERVED & SPEED_PRESERVED: maintains playback continuity", () => {
    const store = useTeleprompterStore.getState();
    store.setIsPlaying(true);
    store.setSpeed(1.5);
    store.setTextSize(32);

    store.setPresentationMode("WORDS_ONLY");
    expect(useTeleprompterStore.getState().isPlaying).toBe(true);
    expect(useTeleprompterStore.getState().speed).toBe(1.5);
    expect(useTeleprompterStore.getState().textSize).toBe(32);

    store.setPresentationMode("OVERLAY");
    expect(useTeleprompterStore.getState().isPlaying).toBe(true);
    expect(useTeleprompterStore.getState().speed).toBe(1.5);
    expect(useTeleprompterStore.getState().textSize).toBe(32);
  });

  it("MIRROR: toggles display mirror without mutating stored script", () => {
    const store = useTeleprompterStore.getState();
    const originalScript = "MIRROR TEST SCRIPT";
    store.setScript(originalScript);

    expect(store.isMirrored).toBe(false);
    store.toggleMirror();
    expect(useTeleprompterStore.getState().isMirrored).toBe(true);
    expect(useTeleprompterStore.getState().script).toBe(originalScript); // script text unchanged

    store.toggleMirror();
    expect(useTeleprompterStore.getState().isMirrored).toBe(false);
    expect(useTeleprompterStore.getState().script).toBe(originalScript);
  });

  it("MONITOR_A_TARGETING & MONITOR_B_TARGETING: allows routing presentation", () => {
    const store = useTeleprompterStore.getState();
    store.setTargetMonitor("a");
    expect(useTeleprompterStore.getState().targetMonitor).toBe("a");

    store.setTargetMonitor("b");
    expect(useTeleprompterStore.getState().targetMonitor).toBe("b");
  });

  it("MIX COMPOSITION: allows managing scrim opacity, reading width, and position", () => {
    const store = useTeleprompterStore.getState();
    store.setOverlayOpacity(0.4);
    expect(useTeleprompterStore.getState().overlayOpacity).toBe(0.4);

    store.setReadingWidthPercent(60);
    expect(useTeleprompterStore.getState().readingWidthPercent).toBe(60);

    store.setOverlayPosition("top");
    expect(useTeleprompterStore.getState().overlayPosition).toBe("top");
  });
});
