jest.mock("next/headers", () => ({ headers: jest.fn() }));
jest.mock("next/script", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/layout/FullAppShell", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/avatar/AvatarStudioExperience", () => {
  const React = require("react");
  const { useAudio } = require("@/components/AudioProvider");
  return {
    __esModule: true,
    default: function AvatarStudioAudioConsumer() {
      useAudio();
      return React.createElement("main", { "data-testid": "avatar-studio-mounted" }, "Avatar Studio");
    },
  };
});

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { headers } from "next/headers";
import RootLayout from "@/app/layout";
import AvatarStudioPage from "@/app/avatar/studio/page";

const headersMock = headers as jest.MockedFunction<typeof headers>;

describe("canonical audio provider around Fan Avatar Studio entry", () => {
  it.each([
    ["auth-critical shell branch", "/auth"],
    ["normal full-app shell branch", "/avatar/studio"],
  ])("mounts the real Avatar Studio route under AudioProvider for %s", async (_label, pathname) => {
    headersMock.mockReturnValue(new Headers({ "x-pathname": pathname }));

    const tree = await RootLayout({ children: <AvatarStudioPage /> });
    const html = renderToStaticMarkup(tree);

    expect(html).toContain('data-testid="avatar-studio-mounted"');
    expect(html).not.toContain("useAudio must be used within an AudioProvider");
  });
});