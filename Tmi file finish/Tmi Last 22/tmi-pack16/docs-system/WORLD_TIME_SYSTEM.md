# WORLD_TIME_SYSTEM.md
## Platform Operating Cycles
Real-time: Room joins, reactions, tips, chat — continuous
15-minute: Lobby wall sort update, discovery boost refresh
Hourly: News bot, trending update
Daily 09:00: Oracle bot, artist spotlight, quest reset, spin reset
Weekly Sun midnight: Crown rotation, archive, issue publish, self-review bot
1st of month 06:00: Monthly evolution report, rankings reset
Quarterly: Season theme change, tournament season
Jan 1: Yearly awards, Hall of Fame update
All times: UTC. Frontend converts to user timezone.
Copilot wires: Cron jobs in apps/api/src/jobs/
