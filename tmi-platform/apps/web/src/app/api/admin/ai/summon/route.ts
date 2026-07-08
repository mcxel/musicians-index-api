import { NextResponse } from 'next/server';

export async function POST(req: Request){
  try{
    const body = await req.json().catch(()=>({}));
    const ai = body?.ai || 'Big Ace';
    // TODO: hook into AI registry / message bus
    console.log('[summon] requested', ai);
    return NextResponse.json({ok:true, summoned: ai});
  }catch(err){
    return NextResponse.json({ok:false, error: String(err)}, {status:500});
  }
}
