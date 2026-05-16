import type { ComponentType } from "react";

export interface HudModule {
  id: string;
  title: string;
  description?: string;
  version?: string;
  render: ComponentType;
  category?: string;
  enabled?: boolean;
}

export interface HudTheme {
  colors: {
    background: string;
    foreground?: string;
    surface?: string;
    accent?: string;
    text?: string;
  };
  borderRadius?: number;
  fontFamily?: string;
}
