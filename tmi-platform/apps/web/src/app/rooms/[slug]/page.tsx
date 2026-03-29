export default function RoomPage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-4">Room: {params.slug}</h1>
      <p className="text-gray-400">Loading room&hellip;</p>
    </main>
  );
}
