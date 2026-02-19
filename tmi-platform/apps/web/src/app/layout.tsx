import type { Metadata } from 'next';
import './globals.css';
import AudioProvider from '@/components/AudioProvider';

export const metadata: Metadata = {
  title: "The Musician's Index - 80s Neon Magazine",
  description: 'Live music magazine with streaming rooms, articles, and fan economy',
  keywords: 'music, magazine, live streaming, 80s, neon, musicians',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Scanline Overlay */}
        <div className="scanlines" />
        
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
