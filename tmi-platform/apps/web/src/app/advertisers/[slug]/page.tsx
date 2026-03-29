export default function Page({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-4">{params.slug}</h1>
      <p className="text-gray-400">Loading profile...</p>
    </main>
  );
}