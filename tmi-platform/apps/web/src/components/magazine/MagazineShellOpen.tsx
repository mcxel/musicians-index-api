"use client";

import { useRouter } from "next/navigation";
import HomeMagazineShell from "@/components/magazine/HomeMagazineShell";
import { getMagShellPolicy } from "@/lib/magazine/MagazineShellState";
import HomePage012Artifact from "@/artifacts/homepages/HomePage012.artifact";

const policy = getMagShellPolicy("MAG_OPEN");

export default function MagazineShellOpen() {
  const router = useRouter();

  return (
    <HomeMagazineShell
      state="open"
      physicalScale={1.14}
      onClose={() => router.push(policy.navigation.back ?? "/home/1")}
    >
      {/* ── Canon open spread artifact — full visual preserved ── */}
      <HomePage012Artifact />
    </HomeMagazineShell>
  );
}
