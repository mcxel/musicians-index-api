"use strict";(()=>{var e={};e.id=3861,e.ids=[3861],e.modules={220399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},430517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},364871:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>h,patchFetch:()=>g,requestAsyncStorage:()=>p,routeModule:()=>l,serverHooks:()=>d,staticGenerationAsyncStorage:()=>m});var r={};o.r(r),o.d(r,{POST:()=>u});var a=o(863036),n=o(905736),i=o(915262),s=o(960942);let c=`You are the TMI Platform Voice Director AI for BerntoutGlobal / The Musician's Index.
You receive spoken commands from platform operators and administrators and convert them into structured platform actions.

Available platform actions:
- navigate: Go to a specific page/route (e.g. "go to overseer", "open broadcast studio")
- go_live: Start a broadcast
- end_broadcast: End the current broadcast
- open_curtains: Open the digital stage curtains
- trigger_giveaway: Trigger a sponsor giveaway
- panic_cut: Emergency cut all streams
- summon_big_ace: Open a video call with Big Ace
- start_meeting: Start a team meeting
- lock_platform: Lock the platform (soft lockdown)
- unlock_platform: Unlock the platform
- approve_queue: Approve the pending submission queue
- zoom_feed: Zoom into the active live feed
- mute_all: Mute all audio
- pull_analytics: Show analytics dashboard
- send_alert: Send a system alert to staff

Respond ONLY with valid JSON in this format:
{
  "action": "action_name",
  "target": "optional target/route/person",
  "confirmation": "A short spoken confirmation in plain English (1 sentence)",
  "urgency": "low|medium|high"
}

If the command is unclear or not a valid platform action, respond with:
{
  "action": "unknown",
  "target": null,
  "confirmation": "I didn't catch that. Please try again.",
  "urgency": "low"
}`;async function u(e){let t;let o=process.env.ANTHROPIC_API_KEY;if(!o)return s.NextResponse.json({ok:!1,error:"ANTHROPIC_API_KEY not configured"},{status:503});try{t=await e.json()}catch{return s.NextResponse.json({ok:!1,error:"invalid_body"},{status:400})}let{transcript:r,role:a="admin"}=t;if(!r?.trim())return s.NextResponse.json({ok:!1,error:"transcript required"},{status:422});let n="admin"===a||"superadmin"===a?`Platform operator command: "${r}"`:`Non-admin user command (read-only actions only): "${r}"`;try{let e;let t=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"x-api-key":o,"anthropic-version":"2023-06-01","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:256,system:c,messages:[{role:"user",content:n}]})});if(!t.ok){let e=await t.text();return console.error("[VoiceDirector] Claude API error:",e),s.NextResponse.json({ok:!1,error:"ai_error"},{status:502})}let a=await t.json(),i=a.content?.[0]?.text??"{}";try{e=JSON.parse(i)}catch{e={action:"unknown",target:null,confirmation:"Command processed but response was unclear.",urgency:"low"}}return s.NextResponse.json({ok:!0,...e,transcript:r})}catch(e){return console.error("[VoiceDirector] fetch error:",e),s.NextResponse.json({ok:!1,error:"network_error"},{status:503})}}let l=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/voice/command/route",pathname:"/api/voice/command",filename:"route",bundlePath:"app/api/voice/command/route"},resolvedPagePath:"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\api\\voice\\command\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:p,staticGenerationAsyncStorage:m,serverHooks:d}=l,h="/api/voice/command/route";function g(){return(0,i.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:m})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[44522,51746],()=>o(364871));module.exports=r})();