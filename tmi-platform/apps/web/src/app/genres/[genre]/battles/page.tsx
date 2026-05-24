"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const VIEWERS = [412, 287, 538, 201, 344, 189, 456, 312];

export default function GenreBattlesPage() {
  const params = useParams();
  const router = useRouter();
  const rawGenre = params?.genre;
  const genre = typeof rawGenre === "string" ? rawGenre : Array.isArray(rawGenre) ? rawGenre[0] : "";
  const genreName = genre.replace(/-/g, " ").toUpperCase();
  const [reminders, setReminders] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState("");

  function joinBattle(i: number) {
    router.push("/arena?genre=" + genre + "&battle=" + i);
  }

  function toggleReminder(i: number) {
    setReminders(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
    setMsg(reminders.has(i) ? "Reminder removed." : "Reminder set — we'll notify you 15 min before.");
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
      <div className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-cyan-300 mb-2">⚡ {genreName} Battles</h1>
          <p className="text-gray-400">Live battles and tournaments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-4">
        {msg && <div style={{ padding: "10px 14px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, fontSize: 12, color: "#00FFFF", marginBottom: 16 }}>{msg}</div>}

        <div className="mb-8">
          <h3 className="text-xl font-bold text-red-400 mb-4">🔴 LIVE NOW</h3>
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-gradient-to-r from-red-900/30 to-transparent border border-red-500/50 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-lg">Live Battle {i}</div>
                  <div className="text-sm text-gray-400">Round 1 · {VIEWERS[i - 1]} viewers</div>
                </div>
                <div className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              </div>
              <button onClick={() => joinBattle(i)} className="w-full py-2 px-3 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                Join Battle
              </button>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-xl font-bold text-cyan-300 mb-4">📅 Upcoming Battles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-cyan-500/50 transition-all">
                <div className="font-semibold mb-2">Battle {i}</div>
                <div className="text-sm text-gray-400 mb-3">
                  <div>📅 June {i + 15}</div>
                  <div>⏰ 6:00 PM UTC</div>
                </div>
                <button onClick={() => toggleReminder(i)} className={`w-full py-2 px-3 rounded text-white text-sm font-medium transition-colors ${reminders.has(i) ? "bg-green-700 hover:bg-green-800" : "bg-cyan-600 hover:bg-cyan-700"}`}>
                  {reminders.has(i) ? "✓ Reminder Set" : "Remind Me"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
