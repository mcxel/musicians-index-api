import os

rooms = [
    ('tmi-platform/apps/web/src/app/rooms/backstage/page.tsx', 'BackstageRoomPage', 'Backstage Room', 'Access the backstage area for artists and crew.'),
    ('tmi-platform/apps/web/src/app/rooms/cypher/page.tsx', 'CypherRoomPage', 'Cypher Room', 'Join the cypher circle and freestyle with other artists.'),
    ('tmi-platform/apps/web/src/app/rooms/dj/page.tsx', 'DJRoomPage', 'DJ Room', 'Experience live DJ sets and music mixes.'),
    ('tmi-platform/apps/web/src/app/rooms/front-row/page.tsx', 'FrontRowRoomPage', 'Front Row Room', 'Get the best seats in the house for live performances.'),
    ('tmi-platform/apps/web/src/app/rooms/game/page.tsx', 'GameRoomPage', 'Game Room', 'Play music trivia and games with other fans.'),
    ('tmi-platform/apps/web/src/app/rooms/interview/page.tsx', 'InterviewRoomPage', 'Interview Room', 'Watch exclusive artist interviews and Q&A sessions.'),
    ('tmi-platform/apps/web/src/app/rooms/listening-party/page.tsx', 'ListeningPartyRoomPage', 'Listening Party', 'Join a listening party for new album drops and releases.'),
    ('tmi-platform/apps/web/src/app/rooms/party-lobby/page.tsx', 'PartyLobbyRoomPage', 'Party Lobby', 'Hang out in the lobby before the main event starts.'),
    ('tmi-platform/apps/web/src/app/rooms/studio/page.tsx', 'StudioRoomPage', 'Studio Room', 'Watch artists create music live in the studio.'),
    ('tmi-platform/apps/web/src/app/rooms/vip/page.tsx', 'VIPRoomPage', 'VIP Room', 'Exclusive access for VIP members and top supporters.'),
    ('tmi-platform/apps/web/src/app/rooms/watch-party/page.tsx', 'WatchPartyRoomPage', 'Watch Party', 'Watch music videos and shows together with the community.'),
]

for path, fn, title, desc in rooms:
    lines = [
        'export default function ' + fn + '() {',
        '  return (',
        '    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">',
        '      <h1 className="text-3xl font-bold text-[#ff6b35] mb-4">' + title + '</h1>',
        '      <p className="text-gray-400">' + desc + '</p>',
        '    </main>',
        '  );',
        '}',
        '',
    ]
    content = '\n'.join(lines)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('FIXED: ' + path)

print('All 11 room pages fixed.')
