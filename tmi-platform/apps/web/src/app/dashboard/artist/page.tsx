"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MeUser = {
  id: string;
  email: string;
  role: string;
  onboardingState: string;
  profileArticleSlug?: string | null;
};

export default function ArtistDashboardPage() {
  const [profileArticleSlug, setProfileArticleSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: MeUser } | null) => {
        if (data?.user?.profileArticleSlug) {
          setProfileArticleSlug(data.user.profileArticleSlug);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Artist Dashboard</h1>
        <p className="mt-3 text-white/70">Your artist onboarding is complete.</p>
        {profileArticleSlug ? (
          <p className="mt-4 text-white/80">
            Your profile article:{" "}
            <Link
              href={`/articles/${profileArticleSlug}`}
              className="text-emerald-400 underline underline-offset-2"
            >
              /articles/{profileArticleSlug}
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
