"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

async function getCsrfToken(): Promise<string | null> {
  const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
  if (!sessionRes.ok) return null;
  const session = (await sessionRes.json()) as { csrfToken?: string | null };
  return session.csrfToken || null;
}

export default function ArtistOnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      setMessage("Unable to complete artist onboarding (missing CSRF token).");
      return;
    }

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ name, bio }),
    });

    if (res.ok) {
      router.replace("/dashboard/artist");
      return;
    }

    setMessage(`Unable to complete artist onboarding (${res.status}).`);
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-3xl font-bold">Artist Onboarding</h1>
        <form onSubmit={submit} className="space-y-3 rounded border border-white/20 p-4">
          <label htmlFor="artist-name" className="block text-sm">Artist name</label>
          <input
            id="artist-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Artist name"
            className="w-full rounded border border-white/20 bg-black/40 px-3 py-2"
            required
          />
          <label htmlFor="artist-bio" className="block text-sm">Short bio</label>
          <textarea
            id="artist-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell fans who you are"
            className="w-full rounded border border-white/20 bg-black/40 px-3 py-2"
            rows={5}
            required
          />
          <button type="submit" className="rounded bg-emerald-600 px-4 py-2">Save and continue</button>
        </form>
        {message ? <p className="text-amber-300 text-sm">{message}</p> : null}
      </div>
    </main>
  );
}
