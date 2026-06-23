"use strict";(()=>{var e={};e.id=19031,e.ids=[19031],e.modules={220399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},430517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48327:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>f,patchFetch:()=>h,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>x,staticGenerationAsyncStorage:()=>b});var i={};r.r(i),r.d(i,{GET:()=>d,POST:()=>p,dynamic:()=>c});var a=r(863036),n=r(905736),s=r(915262),o=r(960942),l=r(665641);let c="force-dynamic";function u(e,t,r,i="#00FFFF"){let a=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${e} — TMI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #050510; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #0a0a1a; border: 1px solid #1a1a2e; border-top: 2px solid ${i}; border-radius: 12px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; }
    .logo { font-size: 11px; letter-spacing: 4px; color: ${i}; text-transform: uppercase; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 16px; }
    p { color: #888; font-size: 15px; line-height: 1.6; margin-bottom: 12px; }
    .email-display { color: ${i}; font-size: 14px; margin: 8px 0 20px; }
    .btn { display: inline-block; margin-top: 20px; padding: 10px 24px; border: 1px solid ${i}; border-radius: 20px; color: ${i}; text-decoration: none; font-size: 13px; letter-spacing: 1px; font-weight: 700; }
    .btn-resub { border-color: #FF2DAA; color: #FF2DAA; margin-left: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">The Musicians Index</div>
    <h1>${t}</h1>
    ${r}
    <a href="https://themusiciansindex.com" class="btn">BACK TO TMI</a>
  </div>
</body>
</html>`;return new o.NextResponse(a,{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}})}async function d(e){let{searchParams:t}=e.nextUrl,r=t.get("token")??"",i=t.get("email")??"",a=t.get("category")??"marketing",n=["marketing","newsletter","transactional","all"].includes(a)?a:"marketing";if(!i||!r)return u("Invalid Link","Invalid Link","<p>This unsubscribe link is missing required parameters. Please use the link from your email.</p>","#FF2DAA");if(!(0,l.Fg)(r,i))return u("Invalid Token","Link Expired or Invalid","<p>This unsubscribe link is no longer valid. Please use the latest unsubscribe link from a recent email.</p>","#FF2DAA");(0,l.r1)(i,n);let s=i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),o="all"===n?"all TMI emails":`${n} emails`;return u("Unsubscribed","You're Unsubscribed",`<p class="email-display">${s}</p>
     <p>You have been removed from ${o}. Transactional emails (tickets, security, billing) will still be sent as required.</p>`,"#00FFFF")}async function p(e){try{let t=await e.json(),{email:r,action:i="unsubscribe",token:a}=t,n=t.category??"marketing",s=["marketing","newsletter","transactional","all"].includes(n)?n:"marketing";if(!r)return o.NextResponse.json({error:"email required"},{status:400});if("resubscribe"===i){if(!a||!(0,l.Fg)(a,r))return o.NextResponse.json({error:"invalid token"},{status:403});return(0,l.O5)(r,s),o.NextResponse.json({ok:!0,action:"resubscribed",category:s})}return(0,l.r1)(r,s),o.NextResponse.json({ok:!0,action:"unsubscribed",category:s})}catch{return o.NextResponse.json({error:"bad request"},{status:400})}}let m=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/email/unsubscribe/route",pathname:"/api/email/unsubscribe",filename:"route",bundlePath:"app/api/email/unsubscribe/route"},resolvedPagePath:"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\api\\email\\unsubscribe\\route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:g,staticGenerationAsyncStorage:b,serverHooks:x}=m,f="/api/email/unsubscribe/route";function h(){return(0,s.patchFetch)({serverHooks:x,staticGenerationAsyncStorage:b})}},665641:(e,t,r)=>{r.d(t,{Bu:()=>s,Fg:()=>o,O5:()=>n,r1:()=>a});let i=new Map;function a(e,t="all"){let r=e.toLowerCase().trim(),a=i.get(r);if(a)"all"===t?(a.categories.add("marketing"),a.categories.add("newsletter"),a.categories.add("transactional"),a.categories.add("all")):a.categories.add(t);else{let e=new Set("all"===t?["marketing","newsletter","transactional","all"]:[t]);i.set(r,{email:r,categories:e,unsubscribedAt:Date.now()})}}function n(e,t="all"){let r=e.toLowerCase().trim(),a=i.get(r);a&&("all"===t?i.delete(r):(a.categories.delete(t),0===a.categories.size&&i.delete(r)))}function s(e,t="marketing"){let r=e.toLowerCase().trim(),a=i.get(r);return!!a&&(a.categories.has("all")||a.categories.has(t))}function o(e,t){return Buffer.from(`${t}:${process.env.TICKET_SECRET_SALT??"tmi-salt"}:unsub`).toString("base64url").slice(0,32)===e}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[44522,51746],()=>r(48327));module.exports=i})();