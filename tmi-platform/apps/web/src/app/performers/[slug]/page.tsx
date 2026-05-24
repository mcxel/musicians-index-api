"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PerformerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : "";

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl text-magenta-400 font-black mb-4">PERFORMER PROFILE: {slug}</h1>

      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900 mb-6">
        <h2 className="text-xl mb-4">Stage Viewport</h2>
        <div className="h-64 bg-black flex items-center justify-center text-zinc-600 border border-zinc-800">Live Stage Preview (Offline)</div>
      </div>

      <button onClick={() => router.push(`/performers/${slug}/dashboard`)} className="bg-magenta-500 text-black px-6 py-2 rounded font-bold uppercase cursor-pointer border-0" style={{ background: "#FF2DAA", color: "#fff" }}>
        Access Performer Dashboard
      </button>
    </div>
  );
}
