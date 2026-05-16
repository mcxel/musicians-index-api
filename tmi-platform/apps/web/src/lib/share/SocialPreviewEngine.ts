import type { Metadata } from 'next';

export interface SocialPreviewInput {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  siteName?: string;
}

const DEFAULT_IMAGE = '/og/tmi-default.jpg';
const DEFAULT_SITE = "The Musician's Index";
const PROD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://themusiciansindex.com';

function absolute(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${PROD_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildSocialPreviewMetadata(input: SocialPreviewInput): Metadata {
  const canonical = absolute(input.path);
  const image = absolute(input.imageUrl || DEFAULT_IMAGE);
  const siteName = input.siteName || DEFAULT_SITE;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
