'use client';

import { useState } from 'react';

const MOCK_PARTY = {
  id: 'party-1',
  leader: 'You',
  members: [
    { id: '1', name: 'You', role: 'LEADER', status: 'online' },
    { id: '2', name: 'DJ Kenzo', role: 'MEMBER', status: 'online' },
    { id: '3', name: 'Amara Osei', role: 'MEMBER', status: 'online' },
  ],
  currentRoom: 'Theater Lobby',
  maxSize: 8,
};

export default function PartyPage() {
  const [inviteInput, setInviteInput] = useState('');
  const [inParty, setInParty] = useState(true);

  if (!inParty) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Party</h1>
        <p className="text-gray-400 mb-10">Create or join a party to explore rooms together.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setInParty(true)}
            className="bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Create Party
          </button>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-xl transition-colors">
            Join with Code
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-[#ff6b35]">Your Party</h1>
        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-semibold">
          ACTIVE
        </span>
      </div>
      <p className="text-gray-400 mb-8">
        Currently in: <span className="text-white font-semibold">{MOCK_PARTY.currentRoom}</span>
      </p>

      {/* Members */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm text-gray-300">
            Members ({MOCK_PARTY.members.length}/{MOCK_PARTY.maxSize})
          </h2>
          <div className="flex gap-1">
            {Array.from({ length: MOCK_PARTY.maxSize }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < MOCK_PARTY.members.length ? 'bg-[#ff6b35]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {MOCK_PARTY.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ff6b35]/20 flex items-center justify-center text-[#ff6b35] text-xs font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-sm text-gray-300 mb-3">Invite Friends</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name..."
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35]"
          />
          <button className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white text-sm font-semibold rounded-lg transition-colors">
            Invite
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-colors">
          Change Room
        </button>
        <button
          onClick={() => setInParty(false)}
          className="py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-semibold transition-colors"
        >
          Leave Party
        </button>
      </div>
    </main>
  );
}
