import Link from 'next/link';

export default function PerformerProfilePage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl text-magenta-400 font-black mb-4">PERFORMER PROFILE: {params.slug}</h1>
      
      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900 mb-6">
        <h2 className="text-xl mb-4">Stage Viewport</h2>
        <div className="h-64 bg-black flex items-center justify-center text-zinc-600 border border-zinc-800">Live Stage Preview (Offline)</div>
      </div>

      <Link href={`/performers/${params.slug}/dashboard`}>
        <button className="bg-magenta-500 text-black px-6 py-2 rounded font-bold uppercase">Access Performer Dashboard</button>
      </Link>
    </div>
  );
}