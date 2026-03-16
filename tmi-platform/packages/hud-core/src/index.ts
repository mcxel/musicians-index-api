export type HudRenderContext = {
  now?: number;
};

export type HudTheme = {
  colors: {
    background: string;
    foreground: string;
    accent: string;
  };
};

export type HudModule = {
  /** Unique id used in registry + routing */
  id: string;

  /** Human label for the HUD picker/list */
  title: string;

  /** Render function for UI-first HUD */
  render: (ctx?: HudRenderContext) => JSX.Element;

  /** Optional metadata for later */
  description?: string;
  version?: string;
};
