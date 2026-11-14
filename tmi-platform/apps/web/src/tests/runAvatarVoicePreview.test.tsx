jest.mock("next/dynamic", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () => (props: { talking?: boolean; phoneme?: string | null }) =>
      React.createElement("div", {
        "data-testid": "avatar-viewer-props",
        "data-talking": String(Boolean(props.talking)),
        "data-phoneme": props.phoneme ?? "rest",
      }),
  };
});

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AvatarForgePreview3D from "@/components/avatar/AvatarForgePreview3D";
import { resolveAvatarVoicePreview } from "@/lib/avatars/AvatarVoicePreview";
import { SoundSystemEngine } from "@/lib/sound/SoundSystemEngine";

describe("Avatar voice preview", () => {
  it("maps voice level to bounded open, mid, close and rest visemes", () => {
    expect(resolveAvatarVoicePreview(0, false)).toEqual({ talking: false, phoneme: null });
    expect(resolveAvatarVoicePreview(0.05, true)).toEqual({ talking: true, phoneme: "vowel-close" });
    expect(resolveAvatarVoicePreview(0.1, true)).toEqual({ talking: true, phoneme: "vowel-mid" });
    expect(resolveAvatarVoicePreview(0.2, true)).toEqual({ talking: true, phoneme: "vowel-open" });
  });

  it("passes speaking and phoneme state into the canonical AvatarViewer", () => {
    const html = renderToStaticMarkup(
      <AvatarForgePreview3D
        profileName="Fan"
        skin="#9b5b38"
        hair="Fade"
        eyes="Neon Blue"
        outfit="Street Fit"
        propName="Neon Mic"
        background="studio"
        lighting="Spotlight"
        pose="Idle"
        accessories={[]}
        talking
        phoneme="vowel-open"
      />,
    );
    expect(html).toContain('data-talking="true"');
    expect(html).toContain('data-phoneme="vowel-open"');
  });

  it("analyzes mic level on the existing sound context without routing input to speakers", () => {
    const source = { connect: jest.fn(), disconnect: jest.fn() };
    const analyser = {
      fftSize: 0,
      smoothingTimeConstant: 0,
      getFloatTimeDomainData: (samples: Float32Array) => samples.fill(0.1),
      disconnect: jest.fn(),
    };
    const audioContext = {
      state: "running",
      destination: {},
      createMediaStreamSource: jest.fn(() => source),
      createAnalyser: jest.fn(() => analyser),
    };
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { AudioContext: jest.fn(() => audioContext) },
    });

    try {
      const monitor = SoundSystemEngine.monitorMicrophone({} as MediaStream);
      expect(monitor).not.toBeNull();
      expect(monitor!.readLevel()).toBeCloseTo(0.1, 3);
      expect(source.connect).toHaveBeenCalledWith(analyser);
      expect(source.connect).not.toHaveBeenCalledWith(audioContext.destination);
      monitor!.disconnect();
      expect(source.disconnect).toHaveBeenCalledTimes(1);
      expect(analyser.disconnect).toHaveBeenCalledTimes(1);
      expect(monitor!.readLevel()).toBe(0);
    } finally {
      if (originalDescriptor) Object.defineProperty(globalThis, "window", originalDescriptor);
      else Reflect.deleteProperty(globalThis, "window");
    }
  });
});