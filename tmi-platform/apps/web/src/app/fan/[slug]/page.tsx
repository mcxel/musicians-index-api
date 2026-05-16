import Link from 'next/link';

export default function FanProfilePage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl text-cyan-400 font-black mb-4">FAN PROFILE: {params.slug}</h1>
      
      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900 mb-6">
        <h2 className="text-xl mb-4">Recent Memories</h2>
        <p className="text-zinc-500 text-sm mb-4">No recent Memory Shards collected.</p>
      </div>

      <div className="flex gap-4">
        <Link href="/fan/dashboard">
          <button className="bg-magenta-500 text-black px-6 py-2 rounded font-bold uppercase">Go to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}