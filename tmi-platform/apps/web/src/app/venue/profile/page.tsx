"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileShell from "@/components/profile/ProfileShell";
import RoleCapabilityPack from "@/components/profile/RoleCapabilityPack";

interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export default function VenueProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; user?: SessionUser }) => {
        if (!d.authenticated || !d.user) {
          router.replace("/auth");
          return;
        }
        setUser(d.user);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  if (!user) return null;

  const displayName = user.name ?? user.email.split("@")[0] ?? "Live Arena Venue";
  const slug = displayName.toLowerCase().replace(/\s+/g, "-");

  return (
    <ProfileShell
      role="venue"
      displayName={displayName}
      slug={slug}
      tagline="TMI Verified Live Venue · 3D Stage Seating, Ticketing & Magazine Spotlight"
      isVerified
    >
      <RoleCapabilityPack role="venue" displayName={displayName} slug={slug} accentColor="#FF8C00" />
    </ProfileShell>
  );
}
