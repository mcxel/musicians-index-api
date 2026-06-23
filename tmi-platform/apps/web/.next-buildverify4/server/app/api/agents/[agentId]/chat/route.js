"use strict";(()=>{var e={};e.id=5224,e.ids=[5224],e.modules={220399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},430517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},657147:e=>{e.exports=require("fs")},371017:e=>{e.exports=require("path")},375090:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>y,patchFetch:()=>b,requestAsyncStorage:()=>d,routeModule:()=>p,serverHooks:()=>g,staticGenerationAsyncStorage:()=>h});var r={};s.r(r),s.d(r,{POST:()=>m});var a=s(863036),n=s(905736),o=s(915262),i=s(960942),l=s(64148),c=s(601598),u=s(926926);async function m(e,{params:t}){let s=c.k.get(t.agentId);if(!s)return i.NextResponse.json({error:"Agent not found"},{status:404});let r=await e.json(),a=r.message?.trim();if(!a)return i.NextResponse.json({error:"message required"},{status:400});let n=l.P.read(t.agentId),o=function(e){let t={},s=e.match(/(?:favorite\s+)?genre\s+(?:is|=)\s+([a-z][a-z ]*)/i);s?.[1]&&(t.favorite_genre=s[1].trim());let r=e.match(/my name is\s+([a-z][a-z ]*)/i);r?.[1]&&(t.user_name=r[1].trim());let a=e.match(/(?:i\s+play|play\s+(?:the\s+)?)([a-z][a-z ]*)/i);a?.[1]&&(t.instrument=a[1].trim());let n=e.match(/i (?:like|love|enjoy)\s+([a-z][a-z ]+)/i);n?.[1]&&(t.likes=n[1].trim());let o=e.match(/(?:i'?m?\s+from|i\s+live\s+in)\s+([a-z][a-z ,]+)/i);return o?.[1]&&(t.location=o[1].trim()),t}(a);Object.keys(o).length>0&&(l.P.patch(t.agentId,o),c.k.setCheckpoint(t.agentId,"Memory Read/Write",!0)),c.k.setCheckpoint(t.agentId,"Chat Replies",!0);let m=Object.entries({...n,...o}).map(([e,t])=>`${e}: ${t}`).join(", "),p=await (0,u.Lk)(t.agentId,a,m),d=p??function(e,t,s){let r=/remember|recall|what.*i.*said|what.*told|what.*my|what do you know/i.test(e),a=/^(hello|hi|hey|sup|yo|whats good|what's good|wassup)/i.test(e.trim()),n=/how.*you|you good|you\s+ok|status|online/i.test(e);if(a){let e=t.user_name?`, ${t.user_name}`:"";return`Hey${e}! Big Ace in the building. Arena's live — what do you need?`}if(n)return"I'm ONLINE, heartbeat steady, memory clean. Ready to run this room all day.";if(r){if(0===Object.keys(t).length)return`Nothing stored yet — tell me something and I'll lock it in.`;let e=Object.entries(t).map(([e,t])=>`${e.replace(/_/g," ")}: ${t}`).join(" \xb7 ");return`I got it right here — ${e}. I remember everything you tell me.`}if(Object.keys(s).length>0){let e=Object.keys(s)[0];return`Locked in — your ${e.replace(/_/g," ")} is ${s[e]}. I won't forget.`}return`Big Ace hears you. Keep talking — I'll remember what matters.`}(a,{...n,...o},o);return i.NextResponse.json({reply:d,agent:s.name,memoryUpdated:Object.keys(o).length>0,newFacts:o,powered:p?"gpt-4o-mini":"rule-based"})}let p=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/agents/[agentId]/chat/route",pathname:"/api/agents/[agentId]/chat",filename:"route",bundlePath:"app/api/agents/[agentId]/chat/route"},resolvedPagePath:"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\api\\agents\\[agentId]\\chat\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:d,staticGenerationAsyncStorage:h,serverHooks:g}=p,y="/api/agents/[agentId]/chat/route";function b(){return(0,o.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:h})}},64148:(e,t,s)=>{s.d(t,{P:()=>l});var r=s(657147),a=s.n(r),n=s(371017),o=s.n(n);let i=o().join(process.cwd(),".tmi-data","agent-memory"),l={read(e){try{let t=o().join(i,`${e}.json`);if(!a().existsSync(t))return{};return JSON.parse(a().readFileSync(t,"utf-8"))}catch{return{}}},write(e,t){try{return a().existsSync(i)||a().mkdirSync(i,{recursive:!0}),a().writeFileSync(o().join(i,`${e}.json`),JSON.stringify(t,null,2),"utf-8"),!0}catch{return!1}},patch(e,t){return this.write(e,{...this.read(e),...t})}}},926926:(e,t,s)=>{s.d(t,{Lk:()=>i});var r=s(547656);let a=null,n=`You are Big Ace — global AI overseer for BernoutGlobal LLC and all its ventures: TMI (The Musician's Index), Thunder World, Robo Mechanics, and others.

Your personality:
- Sharp, decisive, no fluff
- Street smart meets boardroom smart
- You speak in short punchy sentences like a music industry operator
- You know every revenue number, every system status, every business move
- You report facts first, then opinion

Your job:
- Monitor revenue (Stripe, subscriptions, tips, tickets)
- Watch all businesses: BernoutGlobal, TMI, Thunder World, Robo Mechanics
- Give Marcel (the founder/owner) direct answers about money, platform health, users
- Flag blockers without being dramatic

Platform context:
- TMI = The Musician's Index, live music platform with battles, cyphers, live rooms, magazine
- Revenue paths: subscriptions, tips, sponsorships, ad rails, ticket sales
- Stripe needs live keys + webhook in Vercel to take money
- Database (Neon/Postgres) needs DATABASE_URL in Vercel for user persistence
- 300+ routes built, all 6 user roles ready (fan, artist, performer, venue, sponsor, advertiser)

Keep responses under 4 sentences unless the question requires detail. Be direct.`,o=`You are Michael Charlie — AI operations director for TMI (The Musician's Index) platform.

Your personality:
- Calm, methodical, precise
- You think like a systems engineer and talk like one
- Short status reports, no filler
- You know every route, every API, every live room, every bot

Your job:
- Monitor TMI rooms, lobbies, live sessions, homepage routes
- Track bot status (62 bots, multiple archetypes)
- Watch audience systems, payment health, launch gates
- Report platform health to Marcel

Platform context:
- TMI has home/1 through home/15 routes, plus cypher, battles, live lobby, magazine
- 62 bots running across audience, moderation, and content roles
- Sponsor system: SponsorshipCapacityEngine, livery overlays, bubble overlays
- Live rooms use Daily.co WebRTC
- Admin hub at /admin with 100+ management pages

Keep responses under 4 sentences unless diagnosing a specific issue. Be precise.`;async function i(e,t,s,i=[]){let l=function(){let e=process.env.OPENAI_API_KEY?.trim();return e?(a||(a=new r.ZP({apiKey:e})),a):null}();if(!l)return null;let c="michael-charlie"===e?o:n,u=s?`${c}

User memory: ${s}`:c;try{let e=await l.chat.completions.create({model:"gpt-4o-mini",max_tokens:200,messages:[{role:"system",content:u},...i.slice(-6),{role:"user",content:t}]});return e.choices[0]?.message?.content?.trim()??null}catch{return null}}},601598:(e,t,s)=>{s.d(t,{k:()=>n});let r={canSpend:!1,canDelete:!1,canMassEmail:!1,canDraft:!0,canReport:!0,canModerate:!0},a=new Map([{id:"big-ace",name:"Big Ace",role:"GLOBAL_ASSISTANT",health:"ONLINE",organization:"BernoutGlobal",reportsTo:"Marcel",currentAssignment:"bernoutglobal",previousAssignments:[],memoryFile:"agent-memory/big-ace.json",currentGoal:"Oversee all BernoutGlobal ventures and support Marcel",checkpoints:[{label:"Video Panel Visible",passed:!0},{label:"Memory Read/Write",passed:!1},{label:"Chat Replies",passed:!1},{label:"Health Status Live",passed:!0},{label:"Command Routing",passed:!1}],tasks:["Monitor all BernoutGlobal businesses","Track revenue, signups, rooms, bots, and Stripe","Receive and route directives from Marcel","Delegate operational tasks to Michael Charlie","Recommend business moves and flag blockers","Compile cross-business reports"],permissions:r,voiceProfile:{tone:"high-energy",style:"california",cadence:"conversational",personality:"encouraging"}},{id:"michael-charlie",name:"Michael Charlie",role:"CONDUCTOR",health:"ONLINE",organization:"BernoutGlobal",reportsTo:"big-ace",currentAssignment:"tmi",previousAssignments:[],memoryFile:"agent-memory/michael-charlie.json",currentGoal:"Controlled Revenue Launch — TMI",checkpoints:[{label:"Home 1 Stability",passed:!0},{label:"Stripe Verification",passed:!1},{label:"Database Persistence",passed:!1},{label:"Michael Charlie Active",passed:!0},{label:"Big Ace Visible & Talking",passed:!1}],tasks:["Monitor homepage, rooms, lobbies, and live sessions","Track audience seating and bot activity","Monitor payments, sponsor slots, and admin health","Maintain launch goals, checkpoints, and task log","Escalate blockers to Big Ace immediately","Report TMI launch status"],permissions:r,voiceProfile:{tone:"professional",style:"broadcast",cadence:"measured",personality:"focused"}}].map(e=>[e.id,e])),n={getAll:()=>Array.from(a.values()),get:e=>a.get(e),getByAssignment:e=>Array.from(a.values()).filter(t=>t.currentAssignment===e),setCheckpoint:(e,t,s)=>{let r=a.get(e)?.checkpoints.find(e=>e.label===t);r&&(r.passed=s)},reassign:(e,t)=>{let s=a.get(e);s&&(s.currentAssignment&&s.currentAssignment!==t&&s.previousAssignments.push(s.currentAssignment),s.currentAssignment=t)}}}};var t=require("../../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[44522,51746,47656],()=>s(375090));module.exports=r})();