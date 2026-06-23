"use strict";(()=>{var e={};e.id=48666,e.ids=[48666],e.modules={220399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},430517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},718494:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>g,patchFetch:()=>x,requestAsyncStorage:()=>u,routeModule:()=>c,serverHooks:()=>m,staticGenerationAsyncStorage:()=>h});var n={};r.r(n),r.d(n,{POST:()=>p,dynamic:()=>l});var i=r(863036),s=r(905736),o=r(915262),a=r(960942),d=r(799782);let l="force-dynamic";async function p(e){let t;let r=e.headers.get("x-admin-key");if(!r||r!==process.env.ADMIN_API_KEY)return a.NextResponse.json({error:"Unauthorized"},{status:401});try{t=await e.json()}catch{return a.NextResponse.json({error:"Invalid JSON body"},{status:400})}if(!Array.isArray(t.recipients)||0===t.recipients.length)return a.NextResponse.json({error:"recipients must be a non-empty array"},{status:400});let n="string"==typeof t.entryUrl?t.entryUrl:"http://localhost:3000/rooms/world-dance-party",i=t.recipients.slice(0,20).map(e=>({name:String(e.name??"").trim(),email:String(e.email??"").trim().toLowerCase(),note:e.note?String(e.note).trim():void 0})).filter(e=>e.email.includes("@"));if(0===i.length)return a.NextResponse.json({error:"No valid email addresses found"},{status:400});let s=i.map(e=>({recipientName:e.name,recipientEmail:e.email,entryUrl:n,personalNote:e.note})).slice(0,20).map(e=>{var t;return{to:(t={...e,entryUrl:e.entryUrl||n}).recipientEmail,subject:"You're invited to TMI — the room is live right now",html:function(e){let t=`https://themusiciansindex.com/unsubscribe?email=${encodeURIComponent(e.recipientEmail)}`,r=e.personalNote?`<p style="color:#00FFFF;font-style:italic;border-left:3px solid #00FFFF;padding-left:12px;margin:20px 0">${e.personalNote}</p>`:"";return`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050510;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#ffffff">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:11px;letter-spacing:6px;color:#FF2DAA;font-weight:800;margin-bottom:8px">THE MUSICIAN'S INDEX</div>
      <div style="font-size:28px;font-weight:900;letter-spacing:2px">TMI</div>
    </div>

    <!-- Hero -->
    <div style="background:rgba(255,45,170,0.06);border:1px solid rgba(255,45,170,0.2);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
      <div style="font-size:32px;margin-bottom:16px">🎤</div>
      <h1 style="font-size:22px;font-weight:900;margin:0 0 12px;line-height:1.3">
        ${e.recipientName?`${e.recipientName}, you`:"You"}'re invited.
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.6);margin:0 0 24px;line-height:1.6">
        The World Dance Party is live right now.<br>
        Record Ralph is on the decks. The crowd is in here.<br>
        Come see what this is.
      </p>
      <a href="${e.entryUrl}"
        style="display:inline-block;padding:14px 36px;background:#FF2DAA;color:#ffffff;text-decoration:none;font-weight:800;font-size:12px;letter-spacing:3px;border-radius:30px">
        ENTER THE ROOM →
      </a>
    </div>

    ${r}

    <!-- What to expect -->
    <div style="margin-bottom:24px">
      <div style="font-size:9px;letter-spacing:4px;color:rgba(255,255,255,0.35);font-weight:800;margin-bottom:14px">WHAT YOU'LL FIND</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[["\uD83C\uDFA7","Record Ralph live on the decks — rotating sets, daily challenges"],["\uD83E\uDE91","A seat in the arena — yours to hold"],["\uD83C\uDFC6","Artist battles, cyphers, and the Billboard rankings"],["\uD83D\uDCB0","Sponsor and advertiser tools if you're here to grow"]].map(([e,t])=>`
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid rgba(255,255,255,0.06)">
          <span style="font-size:18px;flex-shrink:0">${e}</span>
          <span style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.5">${t}</span>
        </div>`).join("")}
      </div>
    </div>

    <!-- CTA repeat -->
    <div style="text-align:center;margin-bottom:32px">
      <a href="${e.entryUrl}"
        style="display:inline-block;padding:12px 32px;background:rgba(255,45,170,0.1);color:#FF2DAA;text-decoration:none;font-weight:800;font-size:11px;letter-spacing:3px;border-radius:30px;border:1px solid rgba(255,45,170,0.3)">
        JOIN NOW — IT'S FREE TO START
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;text-align:center">
      <div style="font-size:9px;color:rgba(255,255,255,0.2);line-height:1.8">
        TMI \xb7 The Musician's Index \xb7 BerntoutGlobal LLC<br>
        You received this because you're part of the first wave.<br>
        <a href="${t}" style="color:rgba(255,255,255,0.2);text-decoration:none">Unsubscribe</a>
      </div>
    </div>

  </div>
</body>
</html>`}(t),text:`${t.recipientName?`${t.recipientName}, you`:"You"}'re invited to TMI.

The World Dance Party is live right now.
Record Ralph is on the decks.

Enter here: ${t.entryUrl}

What you'll find:
- Record Ralph live on the decks with daily challenges
- Your own seat in the arena
- Artist battles, cyphers, and Billboard rankings
- Sponsor and advertiser tools if you're growing a brand

${t.personalNote?`
"${t.personalNote}"
`:""}

Join at: ${t.entryUrl}

---
TMI \xb7 The Musician's Index \xb7 BerntoutGlobal LLC
`,templateKey:"phase1-invite-v1"}}),o=[];for(let e of s){let t=await d.Z.sendAsync({to:e.to,subject:e.subject,html:e.html,text:e.text,tags:["phase1-invite","batch-1"]});o.push({email:e.to,success:t.success,provider:t.provider,externalId:t.externalId,error:t.error})}let l=o.filter(e=>e.success).length,p=o.filter(e=>!e.success).length;return console.log(`[phase1-invite] Batch dispatched — sent: ${l}, failed: ${p}`),a.NextResponse.json({dispatched:o.length,sent:l,failed:p,results:o})}let c=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/admin/phase1-invite/route",pathname:"/api/admin/phase1-invite",filename:"route",bundlePath:"app/api/admin/phase1-invite/route"},resolvedPagePath:"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\api\\admin\\phase1-invite\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:u,staticGenerationAsyncStorage:h,serverHooks:m}=c,g="/api/admin/phase1-invite/route";function x(){return(0,o.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:h})}},799782:(e,t,r)=>{r.d(t,{R:()=>l,Z:()=>p});let n=process.env.EMAIL_FROM_ADDRESS??"noreply@themusiciansindex.com",i=process.env.EMAIL_FROM_NAME??"TMI Platform";function s(e){return`${e}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`}function o(e){return e.toLowerCase().includes("+fail@")||e.toLowerCase().includes("bounce@")}async function a(e){let t=process.env.RESEND_API_KEY;if(!t)return{success:!0,provider:"dev-stub",externalId:s("resend"),sentAt:Date.now(),devMode:!0};try{let r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({from:`${i} <${n}>`,to:[e.to],subject:e.subject,html:e.html,text:e.text,reply_to:e.replyTo,tags:e.tags?.map(e=>({name:e,value:"1"}))})}),o=await r.json().catch(()=>({}));if(!r.ok)return{success:!1,provider:"resend",externalId:s("resend"),error:o.message??`HTTP ${r.status}`,sentAt:Date.now()};return{success:!0,provider:"resend",externalId:o.id??s("resend"),sentAt:Date.now()}}catch(e){return{success:!1,provider:"resend",externalId:s("resend"),error:String(e),sentAt:Date.now()}}}async function d(e){let t=process.env.SENDGRID_API_KEY;if(!t)return{success:!1,provider:"sendgrid",externalId:s("sendgrid"),error:"SENDGRID_API_KEY not configured",sentAt:Date.now()};try{let r=await fetch("https://api.sendgrid.com/v3/mail/send",{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({personalizations:[{to:[{email:e.to}],subject:e.subject}],from:{email:n,name:i},content:[{type:"text/plain",value:e.text},{type:"text/html",value:e.html}]})}),o=r.headers.get("X-Message-Id")??s("sendgrid");return{success:r.ok,provider:"sendgrid",externalId:o,error:r.ok?void 0:`HTTP ${r.status}`,sentAt:Date.now()}}catch(e){return{success:!1,provider:"sendgrid",externalId:s("sendgrid"),error:String(e),sentAt:Date.now()}}}class l{static setPrimaryProvider(e){}static getProviderConfig(){let e=!!process.env.SENDGRID_API_KEY;return{primary:process.env.RESEND_API_KEY?"resend":e?"sendgrid":"dev-stub",fallback:e?"sendgrid":"dev-stub"}}static send(e){return o(e.to)?{success:!1,provider:"resend",externalId:s("resend"),error:"Simulated failure",sentAt:Date.now()}:{success:!0,provider:"dev-stub",externalId:s("resend"),sentAt:Date.now(),devMode:!0}}static async sendAsync(e){if(o(e.to))return{success:!1,provider:"resend",externalId:s("resend"),error:"Simulated failure",sentAt:Date.now()};let t=await a(e);return t.success?t:await d(e)}}let p=l}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[44522,51746],()=>r(718494));module.exports=n})();