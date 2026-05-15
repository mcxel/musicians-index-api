'use client';
import Link from 'next/link';

export default function ProducerDashboardPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl text-emerald-400 font-black mb-6">PRODUCER DASHBOARD: {params.slug}</h1>
      
      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900 mb-6">
        <h2 className="text-xl mb-4">Beat Upload & Minting</h2>
        <button className="px-6 py-3 bg-emerald-500 text-black rounded font-bold uppercase">Upload New Instrumental</button>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <Link href={`/producers/${params.slug}`}>
          <button className="text-cyan-400 underline">Return to Public Profile</button>
        </Link>
      </div>
    </div>
  );
}