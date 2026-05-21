# SEAT_AND_POSITION_SYSTEM.md
## Position-Based Everything — Queue, Lobby, Arena, Leaderboard
Every live surface tracks slot positions. Position 1 = highest priority/discovery value.
Queue: position = join order (can be reordered by host)
Lobby wall: position = viewer count ascending (0 = 1, 1 = 2, etc.)
Arena: performer positions assigned by host or queue advance
Leaderboard: position = rank (1 = #1 Crown Winner)
Copilot wires: position updated in DB on every join/leave/advance
Proof: positions update in real-time, no stuck slots
