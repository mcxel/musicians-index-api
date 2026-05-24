"use client";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function FanProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : "";

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl text-cyan-400 font-black mb-4">FAN PROFILE: {slug}</h1>

      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900 mb-6">
        <h2 className="text-xl mb-4">Recent Memories</h2>
        <p className="text-zinc-500 text-sm mb-4">No recent Memory Shards collected.</p>
      </div>

      <div className="flex gap-4">
        <button onClick={() => router.push('/fan/dashboard')} className="px-6 py-2 rounded font-bold uppercase cursor-pointer border-0" style={{ background: "#FF2DAA", color: "#fff" }}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
