"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ClosedMagazineShell from "@/components/magazine/ClosedMagazineShell";

export default function HomeLoading() {
  const router = useRouter();
  useEffect(() => {
    // Fail-safe: if server render hasn't resolved in 2.5 s, force a retry.
    const t = setTimeout(() => router.refresh(), 2500);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <main className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-[#06070d]">
      <ClosedMagazineShell title="TMI Home Issue" subtitle="Initializing magazine shell..." />
    </main>
  );
}
