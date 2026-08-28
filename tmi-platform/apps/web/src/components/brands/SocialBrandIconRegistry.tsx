"use client";

/**
 * SocialBrandIconRegistry — official vector marks for X, Instagram, Spotify, YouTube, TikTok.
 * TMI styles the container only; marks stay recognizable.
 */

import type { CSSProperties, ReactElement, SVGProps } from "react";

export type SocialBrandId = "x" | "instagram" | "spotify" | "youtube" | "tiktok";

type SvgProps = SVGProps<SVGSVGElement>;

function XIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
      />
    </svg>
  );
}

function InstagramIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm8.75 1.75a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"
      />
    </svg>
  );
}

function SpotifyIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 1.5C6.201 1.5 1.5 6.201 1.5 12S6.201 22.5 12 22.5 22.5 17.799 22.5 12 17.799 1.5 12 1.5zm4.607 15.198a.75.75 0 0 1-1.03.25c-2.82-1.724-6.37-2.115-10.55-1.16a.75.75 0 1 1-.333-1.463c4.56-1.038 8.48-.59 11.663 1.354a.75.75 0 0 1 .25 1.019zm1.23-2.74a.9.9 0 0 1-1.236.3c-3.226-1.982-8.145-2.558-11.96-1.4a.9.9 0 1 1-.522-1.724c4.36-1.32 9.742-.67 13.418 1.59a.9.9 0 0 1 .3 1.234zm.106-2.86c-3.87-2.298-10.255-2.51-13.94-1.39a1.05 1.05 0 1 1-.608-2.01c4.23-1.28 11.22-1.032 15.63 1.606a1.05 1.05 0 1 1-1.082 1.794z"
      />
    </svg>
  );
}

function YouTubeIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M23.5 7.2a3.02 3.02 0 0 0-2.13-2.14C19.5 4.6 12 4.6 12 4.6s-7.5 0-9.37.46A3.02 3.02 0 0 0 .5 7.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 4.8 3.02 3.02 0 0 0 2.13 2.14c1.87.46 9.37.46 9.37.46s7.5 0 9.37-.46a3.02 3.02 0 0 0 2.13-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-4.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"
      />
    </svg>
  );
}

function TikTokIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .56.04.82.12v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.36a8.2 8.2 0 0 0 4.78 1.52V7.43a4.85 4.85 0 0 1-1.02-.74z"
      />
    </svg>
  );
}

export const SOCIAL_BRAND_REGISTRY: Record<
  SocialBrandId,
  { id: SocialBrandId; label: string; Icon: (p: SvgProps) => ReactElement }
> = {
  x: { id: "x", label: "X", Icon: XIcon },
  instagram: { id: "instagram", label: "Instagram", Icon: InstagramIcon },
  spotify: { id: "spotify", label: "Spotify", Icon: SpotifyIcon },
  youtube: { id: "youtube", label: "YouTube", Icon: YouTubeIcon },
  tiktok: { id: "tiktok", label: "TikTok", Icon: TikTokIcon },
};

/** Map legacy ids (twitter → x). */
export function resolveSocialBrandId(id: string): SocialBrandId | null {
  const k = id.trim().toLowerCase();
  if (k === "twitter" || k === "x") return "x";
  if (k === "instagram" || k === "ig") return "instagram";
  if (k === "spotify") return "spotify";
  if (k === "youtube" || k === "yt") return "youtube";
  if (k === "tiktok" || k === "tt") return "tiktok";
  return null;
}

export function SocialBrandIcon({
  brand,
  size = 20,
  className,
  style,
  title,
}: {
  brand: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  const id = resolveSocialBrandId(brand);
  if (!id) return null;
  const entry = SOCIAL_BRAND_REGISTRY[id];
  const Icon = entry.Icon;
  const label = title ?? entry.label;
  return (
    <span
      role="img"
      aria-label={label}
      className={className}
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        color: "currentColor",
        ...style,
      }}
    >
      <Icon width={size} height={size} focusable="false" />
    </span>
  );
}

export default SocialBrandIcon;
