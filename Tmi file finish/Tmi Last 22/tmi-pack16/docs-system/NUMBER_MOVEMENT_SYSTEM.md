# NUMBER_MOVEMENT_SYSTEM.md
## Every Live Number Animates
Countdown: smooth decrement per second. Color shifts at <30s (gold warning), <10s (red critical).
Viewer count: smooth increment on each new join. Brief pulse on milestone (10, 50, 100, 1000).
Points balance: count-up animation 300ms on award.
Leaderboard position: swap animation 400ms when position changes.
Tip amount: flash highlight for 600ms on new tip.
Stream & Win score: increment animation per point earned.
Implementation: AnimatedCounter component with value, duration, onThreshold props.
Never: raw number change with no animation on a visible live surface.
