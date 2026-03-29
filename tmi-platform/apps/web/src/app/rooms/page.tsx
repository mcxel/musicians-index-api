export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Live Rooms</h1>
      <p className="text-gray-400 mb-8">Join a room, watch a show, or jump into a cypher.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Audience Room", href: "/rooms/audience", desc: "Watch live performances with the crowd." },
          { label: "Premium Front Row", href: "/rooms/front-row", desc: "VIP seats — closest to the stage." },
          { label: "Cypher Stage", href: "/rooms/cypher", desc: "Live freestyle and battle sessions." },
          { label: "Watch Party", href: "/rooms/watch-party", desc: "Watch together in real time." },
          { label: "Game Night", href: "/rooms/game", desc: "Music games and trivia." },
          { label: "Party Lobby", href: "/rooms/party-lobby", desc: "Hang out before the show." },
          { label: "DJ Room", href: "/rooms/dj", desc: "Live DJ sets and mixes." },
          { label: "Backstage", href: "/rooms/backstage", desc: "Behind the scenes access." },
          { label: "Interview Room", href: "/rooms/interview", desc: "Live artist interviews." },
          { label: "VIP Lounge", href: "/rooms/vip", desc: "Exclusive access for top fans." },
          { label: "Studio Session", href: "/rooms/studio", desc: "Watch artists create live." },
          { label: "Listening Party", href: "/rooms/listening-party", desc: "Album and single listening events." },
        ].map((room) => (
          <a
            key={room.href}
            href={room.href}
            className="block bg-[#12121a] border border-[#ff6b35]/20 rounded-xl p-5 hover:border-[#ff6b35]/60 transition-colors"
          >
            <h2 className="text-lg font-semibold text-white mb-1">{room.label}</h2>
            <p className="text-sm text-gray-400">{room.desc}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
