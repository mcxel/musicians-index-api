"use strict";(()=>{var e={};e.id=94023,e.ids=[94023],e.modules={220399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},430517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},124569:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>y,patchFetch:()=>b,requestAsyncStorage:()=>x,routeModule:()=>f,serverHooks:()=>h,staticGenerationAsyncStorage:()=>v});var i={};r.r(i),r.d(i,{GET:()=>u,POST:()=>g,dynamic:()=>l});var o=r(863036),a=r(905736),n=r(915262),s=r(960942),d=r(887761);let l="force-dynamic";function p(e,t=160){return"string"!=typeof e?"":e.trim().slice(0,t)}function c(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function m(e,t){return/^#[0-9a-fA-F]{6}$/.test(e)?e.toUpperCase():t}async function u(){let e=process.env.INTERNAL_TICKET_PRINT_API_KEY?.trim();return s.NextResponse.json({ok:!0,route:"tickets-render-v2",supports:["html","venue-custom-fields","rate-limit"],auth:e?"optional-internal-key-or-same-origin":"disabled"})}async function g(e){try{var t,r;let i=process.env.INTERNAL_TICKET_PRINT_API_KEY?.trim(),o=e.headers.get("x-tmi-print-key")?.trim();if(i&&o!==i&&!function(e){if("same-origin"===e.headers.get("sec-fetch-site")?.toLowerCase())return!0;let t=e.headers.get("origin")?.trim(),r=e.headers.get("host")?.trim();if(!t||!r)return!1;try{return new URL(t).host===r}catch{return!1}}(e))return s.NextResponse.json({error:"Unauthorized print request"},{status:401});let a=e.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";if(!(0,d.Dn)(`tickets:render:${a}`,80,6e4).allowed)return s.NextResponse.json({error:"Rate limit exceeded. Please retry shortly."},{status:429,headers:{"Retry-After":"60"}});let n=await e.json(),l=p(n.ticketId,80),u=p(n.venueName,90),g=p(n.eventTitle,120);if(!l||!u||!g)return s.NextResponse.json({error:"Missing required fields: ticketId, venueName, eventTitle"},{status:400});let f=p(n.eventDate,40)||"TBA",x=p(n.eventTime,40)||"TBA",v=p(n.section,20)||"GENERAL",h=p(n.row,12)||"GA",y=p(n.seat,12)||"OPEN",b=p(n.holderName,80)||"Guest",w=p(n.qrCodeHash,200)||l,k=m(p(n.accentColor,7),"#00FFFF"),T=m(p(n.borderColor,7),"#FFD700"),A=p(n.termsText,180)||"Admit one. Non-refundable. Subject to venue policy.",$=(t=n.customFields,Array.isArray(t)?t.slice(0,8).map(e=>({label:p(e.label,24),value:p(e.value,120)})).filter(e=>e.label&&e.value):[]),C="attachment"===n.mode?"attachment":"inline",N=function(e){let t=encodeURIComponent(e.qrCodeHash),r=e.customFields.map(e=>`<div style="display:flex;justify-content:space-between;gap:12px;margin-top:6px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:4px;"><span style="color:#9ca3af;font-size:11px;letter-spacing:0.08em;">${c(e.label)}</span><span style="color:#e5e7eb;font-size:11px;font-weight:700;text-align:right;">${c(e.value)}</span></div>`).join("");return`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TMI Ticket ${c(e.ticketId)}</title>
  </head>
  <body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#050510;color:#e5e7eb;padding:24px;">
    <main style="max-width:700px;margin:0 auto;border:3px solid ${e.borderColor};border-radius:12px;background:linear-gradient(150deg,#06070d,#0d1020);padding:24px 24px 20px;box-shadow:0 0 24px rgba(0,0,0,0.3);">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(255,255,255,0.14);padding-bottom:12px;">
        <div>
          <h1 style="margin:0;font-size:14px;letter-spacing:0.22em;color:${e.accentColor};text-transform:uppercase;">The Musician's Index</h1>
          <h2 style="margin:8px 0 0;font-size:22px;color:#f8fafc;">${c(e.venueName)}</h2>
        </div>
        <div style="padding:6px 10px;border:1px solid ${e.accentColor};border-radius:6px;color:${e.accentColor};font-weight:800;font-size:10px;letter-spacing:0.16em;">ADMIT ONE</div>
      </header>

      <section style="margin-top:14px;display:grid;grid-template-columns:1fr auto;gap:16px;">
        <div>
          <p style="margin:0;color:#9ca3af;font-size:11px;letter-spacing:0.16em;">EVENT</p>
          <p style="margin:4px 0 10px;font-size:20px;font-weight:800;color:#ffffff;">${c(e.eventTitle)}</p>

          <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;">
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px;"><div style="font-size:9px;color:#9ca3af;letter-spacing:0.1em;">DATE</div><div style="font-size:12px;font-weight:700;">${c(e.eventDate)}</div></div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px;"><div style="font-size:9px;color:#9ca3af;letter-spacing:0.1em;">TIME</div><div style="font-size:12px;font-weight:700;">${c(e.eventTime)}</div></div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px;"><div style="font-size:9px;color:#9ca3af;letter-spacing:0.1em;">SECTION</div><div style="font-size:12px;font-weight:700;">${c(e.section)}</div></div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px;"><div style="font-size:9px;color:#9ca3af;letter-spacing:0.1em;">ROW / SEAT</div><div style="font-size:12px;font-weight:700;">${c(e.row)} / ${c(e.seat)}</div></div>
          </div>

          <div style="margin-top:10px;font-size:11px;color:#d1d5db;"><strong style="color:${e.accentColor};">Holder:</strong> ${c(e.holderName)}</div>
          <div style="margin-top:6px;font-size:11px;color:#9ca3af;"><strong style="color:${e.accentColor};">Ticket ID:</strong> ${c(e.ticketId)}</div>
          ${r}
        </div>

        <aside style="width:172px;">
          <div style="width:162px;height:162px;border-radius:8px;background:#fff;padding:8px;margin:0 auto;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t}" alt="Ticket QR" width="150" height="150" style="display:block;width:150px;height:150px;" />
          </div>
        </aside>
      </section>

      <footer style="margin-top:14px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.2);font-size:10px;color:#9ca3af;letter-spacing:0.08em;">
        ${c(e.termsText)}
      </footer>
    </main>
  </body>
</html>`}({ticketId:l,venueName:u,eventTitle:g,eventDate:f,eventTime:x,section:v,row:h,seat:y,holderName:b,qrCodeHash:w,accentColor:k,borderColor:T,termsText:A,customFields:$}),I=l.replace(/[^a-zA-Z0-9_-]/g,"").slice(0,42)||"ticket";return new s.NextResponse(N,{headers:(r=`tmi-ticket-${I}.html`,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","X-Frame-Options":"SAMEORIGIN","Content-Security-Policy":"default-src 'none'; img-src 'self' https: data:; style-src 'unsafe-inline';","Content-Disposition":`${C}; filename="${r}"`})})}catch{return s.NextResponse.json({error:"Unable to generate print ticket"},{status:500})}}let f=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/tickets/render/route",pathname:"/api/tickets/render",filename:"route",bundlePath:"app/api/tickets/render/route"},resolvedPagePath:"C:\\Users\\Admin\\Documents\\BerntoutGlobal XXL\\tmi-platform\\apps\\web\\src\\app\\api\\tickets\\render\\route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:x,staticGenerationAsyncStorage:v,serverHooks:h}=f,y="/api/tickets/render/route";function b(){return(0,n.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:v})}},887761:(e,t,r)=>{r.d(t,{Dn:()=>o,dj:()=>n}),r(960942);let i=new Map;function o(e,t=100,r=6e4){let o=Date.now(),a=i.get(e);if(!a||o>a.resetAt)return i.set(e,{count:1,resetAt:o+r}),{allowed:!0,remaining:t-1,resetMs:o+r};a.count++;let n=Math.max(0,t-a.count);return{allowed:a.count<=t,remaining:n,resetMs:a.resetAt}}let a=new Set(["mailinator.com","guerrillamail.com","tempmail.com","throwaway.email","yopmail.com","sharklasers.com","guerrillamailblock.com","trashmail.com","10minutemail.com","dispostable.com","fakeinbox.com","spamgourmet.com"]);function n(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)?!function(e){let t=e.split("@")[1]?.toLowerCase().trim();return!t||a.has(t)}(e)?{valid:!0}:{valid:!1,error:"Temporary email addresses are not allowed"}:{valid:!1,error:"Invalid email format"}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[44522,51746],()=>r(124569));module.exports=i})();