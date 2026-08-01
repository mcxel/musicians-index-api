"use client";

/**
 * Article-page access point for Performer Bio & Magazine drawer.
 * Owner/admin: opens management drawer.
 * Public: article only; writers may Request Interview (role-gated).
 */

import { useState } from "react";
import RoleGate from "@/components/auth/RoleGate";
import UniversalDrawerBase from "@/components/drawers/UniversalDrawerBase";
import PerformerBioMagazineDrawer from "@/components/drawers/PerformerBioMagazineDrawer";
import { animationForDrawerModule } from "@/lib/drawers/UniversalDrawerRegistry";
import { getTierColor, getPerformerBySlug } from "@/lib/performers/PerformerRegistry";

export interface PerformerBioMagazineLauncherProps {
  performerSlug: string;
}

export default function PerformerBioMagazineLauncher({
  performerSlug,
}: PerformerBioMagazineLauncherProps) {
  const [openManage, setOpenManage] = useState(false);
  const [openInterview, setOpenInterview] = useState(false);
  const performer = getPerformerBySlug(performerSlug);
  const accent = performer ? getTierColor(performer.tier) : "#00FFFF";

  return (
    <>
      <RoleGate allow={["PERFORMER", "ARTIST", "ADMIN", "STAFF"]}>
        <button
          type="button"
          onClick={() => setOpenManage(true)}
          style={{
            padding: "9px 18px",
            background: `${accent}18`,
            border: `1.5px solid ${accent}`,
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 900,
            color: accent,
            letterSpacing: "0.06em",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Bio & Magazine
        </button>
      </RoleGate>

      <RoleGate allow={["WRITER", "ADMIN", "STAFF"]}>
        <button
          type="button"
          onClick={() => setOpenInterview(true)}
          style={{
            padding: "9px 18px",
            background: "rgba(255,45,170,0.12)",
            border: "1.5px solid rgba(255,45,170,0.55)",
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 900,
            color: "#FF2DAA",
            letterSpacing: "0.06em",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Request Interview
        </button>
      </RoleGate>

      <UniversalDrawerBase
        open={openManage}
        animationId={animationForDrawerModule("bio_magazine")}
        title="PERFORMER BIO & MAGAZINE"
        subtitle="Profile · Bio · Article · Gallery · Music · Interviews · Store & Commerce"
        onClose={() => setOpenManage(false)}
        mode="overlay"
        accentColor={accent}
        contentKey="bio_magazine_manage"
        ariaLabel="Performer Bio and Magazine"
      >
        <PerformerBioMagazineDrawer
          performerSlug={performerSlug}
          accentColor={accent}
          showRequestInterview={false}
          onPreview={() => setOpenManage(false)}
        />
      </UniversalDrawerBase>

      <UniversalDrawerBase
        open={openInterview}
        animationId={animationForDrawerModule("bio_magazine")}
        title="REQUEST INTERVIEW"
        subtitle={performer?.name ?? performerSlug}
        onClose={() => setOpenInterview(false)}
        mode="overlay"
        accentColor="#FF2DAA"
        contentKey="bio_magazine_interview"
        ariaLabel="Request Interview"
      >
        <PerformerBioMagazineDrawer
          performerSlug={performerSlug}
          accentColor="#FF2DAA"
          showRequestInterview
        />
      </UniversalDrawerBase>
    </>
  );
}
