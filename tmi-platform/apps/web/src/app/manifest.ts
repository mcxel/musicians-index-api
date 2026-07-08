import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Musician's Index",
    short_name: 'TMI',
    description: 'Live music battles, cyphers, artist discovery, and magazine storytelling in one installable experience.',
    start_url: '/home/1',
    display: 'standalone',
    background_color: '#050510',
    theme_color: '#00FFFF',
    orientation: 'portrait',
    icons: [
      {
        src: '/og-image.jpg',
        sizes: '1200x630',
        type: 'image/jpeg',
        purpose: 'any',
      },
    ],
  };
}
