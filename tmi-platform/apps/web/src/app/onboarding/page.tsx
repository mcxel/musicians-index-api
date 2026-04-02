'use client';
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Loading onboarding...");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store" });

        if (!res.ok) {
          router.replace("/auth?next=%2Fonboarding");
          return;
        }

        const me = await res.json();

        if (me.user?.role === "admin") {
          router.replace("/dashboard/admin");
          return;
        }

        if (me.user?.role === "artist") {
          router.replace("/dashboard/artist");
          return;
        }

        if (me.user?.role === "fan") {
          router.replace("/dashboard/fan");
          return;
        }

        setMessage("Choose a role to continue onboarding.");
      } catch {
        setMessage("Unable to load onboarding state.");
      }
    };

    void run();
  }, [router]);

  return (
    <main style={{ padding: 40 }}>
      <h1>Onboarding</h1>
      <p>{message}</p>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.push("/onboarding/fan")}>
          Continue as Fan
        </button>
        <button onClick={() => router.push("/onboarding/artist")}>
          Continue as Artist
        </button>
      </div>
    </main>
  );
}
