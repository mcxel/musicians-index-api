"use client";

import type { ReactNode } from "react";
import ProfileWorldShell from "@/components/profileworld/ProfileWorldShell";
import type { ProfileTierSkin } from "@/components/profileworld/ProfileTierSkinEngine";

type CanonZones = {
  headerZone?: ReactNode;
  stageZone?: ReactNode;
  reactionZone?: ReactNode;
  tipZone?: ReactNode;
  playlistZone?: ReactNode;
  botStripZone?: ReactNode;
  rightTowerZone?: ReactNode;
  bottomActionZone?: ReactNode;
  engineLogZone?: ReactNode;
};

type ProfileCanonShellProps =
  | {
      children: ReactNode;
      skin?: never;
      title?: never;
      subtitle?: never;
      topControls?: never;
      zones?: never;
    }
  | {
      skin: ProfileTierSkin;
      title: string;
      subtitle: string;
      topControls?: ReactNode;
      zones: CanonZones;
      children?: never;
    };

export default function ProfileCanonShell(props: ProfileCanonShellProps) {
  if ("children" in props) {
    return <>{props.children}</>;
  }

  return <ProfileWorldShell {...props} />;
}
