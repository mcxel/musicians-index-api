'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type StoryScene = {
  id: string;
  leftSrc: string;
  rightSrc: string;
  eyebrow: string;
  title: string;
  bullets: string[];
};

const STORY_SCENES: StoryScene[] = [
  {
    id: 'broadcast-live',
    leftSrc: '/tmi-source/Host , Julius , and extra/Tiana monday night stage host.jpg',
    rightSrc: '/tmi-source/game show and venue skins/images (31).jpg',
    eyebrow: 'Broadcast Live',
    title: 'Host the moment. Film the stage.',
    bullets: ['Go Live', 'Record performances', 'Build your audience'],
  },
  {
    id: 'festival-energy',
    leftSrc: '/tmi-source/game show and venue skins/images (24).jpg',
    rightSrc: '/tmi-source/game show and venue skins/images (35).jpg',
    eyebrow: 'Big Stage Energy',
    title: 'From outdoor crowds to lit main stages.',
    bullets: ['Bands welcome', 'Comedy nights', 'Dance showcases'],
  },
  {
    id: 'feature-and-promote',
    leftSrc: '/tmi-source/Host , Julius , and extra/Tiana monday night stage host.jpg',
    rightSrc: '/tmi-source/game show and venue skins/images (24).jpg',
    eyebrow: 'Get Featured',
    title: 'Perform. Promote. Get seen here.',
    bullets: ['Magazine moments', 'Event promotion', 'Live discovery'],
  },
];

function useDesktopRailVisibility(minWidth = 1900) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.innerWidth >= minWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [minWidth]);

  return visible;
}

export default function DesktopAtmosphereRails() {
  const isDesktop = useDesktopRailVisibility();
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    if (!isDesktop) return;
    const id = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % STORY_SCENES.length);
    }, 9000);
    return () => window.clearInterval(id);
  }, [isDesktop]);

  if (!isDesktop) return null;

  const scene = STORY_SCENES[sceneIndex]!;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          // Center zone must stay wider than any real page content that
          // mounts this component (Fan Hub's 220px rail + fluid center +
          // 330px chat rail alone can exceed 1500px) — otherwise this
          // decorative overlay's zIndex:1 dark gradient bleeds over real
          // content instead of staying confined to genuinely empty margin.
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1600px) minmax(0,1fr)',
          gap: 0,
        }}
      >
        <AtmosphereRail
          key={`left-${scene.id}`}
          side="left"
          imageSrc={scene.leftSrc}
          eyebrow={scene.eyebrow}
          title={scene.title}
          bullets={scene.bullets}
        />
        <div />
        <AtmosphereRail
          key={`right-${scene.id}`}
          side="right"
          imageSrc={scene.rightSrc}
          eyebrow={scene.eyebrow}
          title={scene.title}
          bullets={scene.bullets}
        />
      </div>
    </div>
  );
}

function AtmosphereRail({
  side,
  imageSrc,
  eyebrow,
  title,
  bullets,
}: {
  side: 'left' | 'right';
  imageSrc: string;
  eyebrow: string;
  title: string;
  bullets: string[];
}) {
  const gradient =
    side === 'left'
      ? 'linear-gradient(90deg, rgba(5,3,16,0.96) 0%, rgba(5,3,16,0.72) 44%, rgba(5,3,16,0.12) 100%)'
      : 'linear-gradient(270deg, rgba(5,3,16,0.96) 0%, rgba(5,3,16,0.72) 44%, rgba(5,3,16,0.12) 100%)';

  return (
    <div
      style={{
        position: 'relative',
        minWidth: 0,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: side === 'left' ? '0 0 0 0' : '0 0 0 0',
          opacity: 0.62,
          transform: 'scale(1.06)',
          animation: 'tmiAtmosphereKenBurns 10s linear infinite alternate',
        }}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="20vw"
          style={{ objectFit: 'cover', objectPosition: side === 'left' ? 'center left' : 'center right' }}
          priority={false}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: gradient,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: side === 'left'
            ? 'linear-gradient(180deg, rgba(0,255,255,0.10), transparent 24%, transparent 76%, rgba(255,45,170,0.16))'
            : 'linear-gradient(180deg, rgba(255,215,0,0.10), transparent 24%, transparent 76%, rgba(0,229,255,0.16))',
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 24,
          [side === 'left' ? 'left' : 'right']: 18,
          width: 'min(240px, 88%)',
          border: side === 'left' ? '1px solid rgba(255,45,170,0.34)' : '1px solid rgba(255,215,0,0.34)',
          background: 'rgba(8,6,20,0.7)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.34)',
          backdropFilter: 'blur(8px)',
          borderRadius: 10,
          padding: '12px 14px',
        }}
      >
        <div
          style={{
            color: side === 'left' ? '#FF2DAA' : '#FFD700',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 6,
            fontFamily: "'Orbitron','Inter',sans-serif",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            color: '#F8FAFF',
            fontSize: 18,
            lineHeight: 1.05,
            fontWeight: 900,
            textTransform: 'uppercase',
            textWrap: 'balance',
            fontFamily: "'Bebas Neue','Impact','Arial Black',sans-serif",
            textShadow: '0 2px 18px rgba(0,0,0,0.48)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {bullets.map((bullet) => (
            <span
              key={`${side}-${bullet}`}
              style={{
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.84)',
                padding: '4px 8px',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {bullet}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}