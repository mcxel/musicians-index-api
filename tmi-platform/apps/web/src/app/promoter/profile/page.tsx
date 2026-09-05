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

export default function PromoterProfilePage() {
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

  const displayName = user.name ?? user.email.split("@")[0] ?? "Promoter Agency";
  const slug = displayName.toLowerCase().replace(/\s+/g, "-");

  return (
    <ProfileShell
      role="promoter"
      displayName={displayName}
      slug={slug}
      tagline="TMI Certified Promoter Agency · Event Curation & Press Asset Distribution"
      isVerified
    >
      <RoleCapabilityPack role="promoter" displayName={displayName} slug={slug} accentColor="#00FF88" />
    </ProfileShell>
  );
}
