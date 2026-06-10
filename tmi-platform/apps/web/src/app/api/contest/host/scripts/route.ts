import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json([
    { id: 'open',      label: 'Opening',         script: "Welcome to TMI's Grand Platform Contest! Tonight we crown the best. Let's get it started!" },
    { id: 'intro',     label: 'Intro Round',     script: "Each performer gets 60 seconds. Judges — score on originality, delivery, and crowd energy." },
    { id: 'battle',    label: 'Battle Round',     script: "Head to head. One stage. Two performers. Crowd decides who advances." },
    { id: 'final',     label: 'Grand Finale',     script: "This is it. The final round. The winner takes the crown and the championship belt." },
    { id: 'winner',    label: 'Winner Announce',  script: "By unanimous decision — the crowd has spoken. Tonight's champion is..." },
    { id: 'close',     label: 'Closing',          script: "That's a wrap on another legendary TMI contest. See you next time!" },
  ]);
}
