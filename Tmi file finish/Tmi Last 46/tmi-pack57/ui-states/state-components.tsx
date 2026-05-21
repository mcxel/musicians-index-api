// apps/web/src/components/states/StateComponents.tsx
// Universal UI states: loading, empty, error, offline, locked, premium, degraded.
// Every belt/page/card must import from here — no ad-hoc empty states.
"use client";
const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

function StateShell({ icon, title, body, cta, color }: { icon:string; title:string; body?:string; cta?:React.ReactNode; color:string }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 20px", textAlign:"center", gap:8 }}>
      <div style={{ fontSize:36, marginBottom:4 }}>{icon}</div>
      <div style={{ fontFamily:T.heading, fontSize:13, color, letterSpacing:1 }}>{title}</div>
      {body && <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, maxWidth:260, lineHeight:1.6 }}>{body}</div>}
      {cta && <div style={{ marginTop:8 }}>{cta}</div>}
    </div>
  );
}

export function LoadingBelt({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{ padding:"24px 16px", display:"flex", gap:8, overflow:"hidden" }}>
      {Array.from({length:4}).map((_,i)=>(
        <div key={i} style={{ flex:1, height:120, background:`linear-gradient(135deg,${T.raised},${T.card})`, borderRadius:10, border:`1px solid ${T.text3}22`, animation:`shimmer ${0.8+i*0.1}s infinite alternate` }} />
      ))}
    </div>
  );
}

export function EmptyBelt({ title, message, cta }: { title:string; message?:string; cta?:React.ReactNode }) {
  return <StateShell icon="🎵" title={title} body={message} cta={cta} color={T.teal} />;
}

export function ErrorBelt({ message, onRetry }: { message?:string; onRetry?:()=>void }) {
  return (
    <StateShell icon="⚠️" title="Something went wrong" body={message || "We're having trouble loading this section."} color={T.pink}
      cta={onRetry && <button onClick={onRetry} style={{ padding:"6px 16px", background:T.pink, color:T.text, border:"none", borderRadius:6, fontFamily:T.heading, fontSize:10, cursor:"pointer", letterSpacing:1 }}>TRY AGAIN</button>}
    />
  );
}

export function OfflineState({ onRetry }: { onRetry?:()=>void }) {
  return (
    <StateShell icon="📡" title="No Connection" body="Check your internet connection. Your progress is saved." color={T.amber}
      cta={onRetry && <button onClick={onRetry} style={{ padding:"6px 16px", background:T.amber, color:"#0D0520", border:"none", borderRadius:6, fontFamily:T.heading, fontSize:10, cursor:"pointer", letterSpacing:1 }}>RECONNECT</button>}
    />
  );
}

export function LockedState({ title, reason, ctaLabel, ctaHref }: { title:string; reason?:string; ctaLabel?:string; ctaHref?:string }) {
  return (
    <StateShell icon="🔒" title={title} body={reason} color={T.text3}
      cta={ctaLabel && ctaHref && <a href={ctaHref} style={{ padding:"6px 16px", background:T.gold, color:"#0D0520", border:"none", borderRadius:6, fontFamily:T.heading, fontSize:10, cursor:"pointer", letterSpacing:1, textDecoration:"none" }}>{ctaLabel}</a>}
    />
  );
}

export function PremiumState({ featureName, minTier, upgradeHref }: { featureName:string; minTier:string; upgradeHref:string }) {
  return (
    <StateShell icon="👑" title={`${featureName} — ${minTier}+ Required`} body="Upgrade your plan to unlock this feature and more." color={T.gold}
      cta={<a href={upgradeHref} style={{ padding:"8px 20px", background:`linear-gradient(90deg,${T.gold},${T.amber})`, color:"#0D0520", borderRadius:6, fontFamily:T.display, fontSize:16, letterSpacing:2, textDecoration:"none" }}>UPGRADE →</a>}
    />
  );
}

export function DegradedState({ serviceName, message }: { serviceName:string; message?:string }) {
  return (
    <div style={{ background:`${T.amber}11`, border:`1px solid ${T.amber}44`, borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:14 }}>⚠️</span>
      <div>
        <div style={{ fontFamily:T.heading, fontSize:9, color:T.amber, letterSpacing:1 }}>{serviceName} DEGRADED</div>
        <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>{message || "Showing cached data"}</div>
      </div>
    </div>
  );
}

export function MaintenanceState({ estimatedReturn }: { estimatedReturn?: string }) {
  return (
    <StateShell icon="🔧" title="Maintenance Mode" body={`The Index is being updated. We'll be back soon.${estimatedReturn ? ` Est. return: ${estimatedReturn}` : ""}`} color={T.teal} />
  );
}

export function SuccessState({ title, message, cta }: { title:string; message?:string; cta?:React.ReactNode }) {
  return <StateShell icon="✅" title={title} body={message} cta={cta} color={T.teal} />;
}

export function EmptyRoomState({ onJoinRandom }: { onJoinRandom?:()=>void }) {
  return (
    <StateShell icon="🎤" title="No Rooms Active Right Now" body="Be the first to go live! 0 viewers = position 1 on the lobby wall." color={T.teal}
      cta={<div style={{ display:"flex", gap:8 }}>
        {onJoinRandom && <button onClick={onJoinRandom} style={{ padding:"6px 16px", background:T.pink, color:T.text, border:"none", borderRadius:6, fontFamily:T.heading, fontSize:10, cursor:"pointer" }}>JOIN RANDOM</button>}
        <a href="/live/start" style={{ padding:"6px 16px", background:T.gold, color:"#0D0520", borderRadius:6, fontFamily:T.heading, fontSize:10, textDecoration:"none" }}>GO LIVE</a>
      </div>}
    />
  );
}

export function SkeletonCard({ height = 120, width = "100%" }: { height?: number; width?: number | string }) {
  return <div style={{ height, width, background:`linear-gradient(135deg,${T.raised},${T.card})`, borderRadius:10, border:`1px solid ${T.text3}11` }} />;
}
