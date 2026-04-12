'use client';

import { type ReactNode } from 'react';
import sceneStyles from '@/styles/home/scene.module.css';
import motionStyles from '@/styles/home/motion.module.css';
import { type SceneId } from '@/lib/scenes/sceneMixins';

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

interface HomeSceneProps {
  children: ReactNode;
  scene: SceneId;
  className?: string;
  title?: string;
  subtitle?: string;
}

const SCENE_CLASS_MAP: Record<SceneId, string> = {
  audienceRoom: sceneStyles.audienceRoom,
  frontRow: sceneStyles.frontRow,
  watchParty: sceneStyles.watchParty,
  cypherRoom: sceneStyles.cypherRoom,
  liveStage: sceneStyles.liveStage,
  lobbyWall: sceneStyles.lobbyWall,
  gameNight: sceneStyles.liveStage,
  nameThatTune: sceneStyles.liveStage,
  dealOrFeud: sceneStyles.liveStage,
  promotionalHub: sceneStyles.lobbyWall,
  adminCommand: sceneStyles.lobbyWall,
  bookingDashboard: sceneStyles.lobbyWall,
  winnersHall: sceneStyles.frontRow,
  articles: sceneStyles.lobbyWall,
  sponsorHub: sceneStyles.watchParty,
};

export default function HomeScene({
  children,
  scene,
  className,
  title,
  subtitle,
}: Readonly<HomeSceneProps>) {
  return (
    <section
      className={cn(
        sceneStyles.scene,
        SCENE_CLASS_MAP[scene],
        motionStyles.fadeUp,
        className,
      )}
      aria-label={title ?? scene}
    >
      <div className={sceneStyles.lightGrid} aria-hidden />
      {(title || subtitle) && (
        <header className={sceneStyles.sceneHeader}>
          {title ? (
            <h2 className={sceneStyles.sceneTitle}>
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className={sceneStyles.sceneSubtitle}>{subtitle}</p>
          ) : null}
        </header>
      )}
      <div className={sceneStyles.sceneBody}>{children}</div>
      <div className={sceneStyles.stageFloor} aria-hidden />
    </section>
  );
}
