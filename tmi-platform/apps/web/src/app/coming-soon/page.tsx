import Link from 'next/link';

export const metadata = { title: 'Coming Soon — The Musician\'s Index' };

export default function ComingSoonPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes csGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes csTicker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes csPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
      `}</style>

      {/* Background glow blobs */}
      <div aria-hidden style={{ position:'absolute', top:'20%', left:'10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(170,45,255,0.18) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div aria-hidden style={{ position:'absolute', bottom:'15%', right:'8%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,255,136,0.12) 0%,transparent 70%)', pointerEvents:'none' }} />

      {/* Frame */}
      <div aria-hidden style={{ position:'absolute', inset:0, border:'3px solid #6D28D9', pointerEvents:'none', zIndex:10 }} />
      <div aria-hidden style={{ position:'absolute', inset:7, border:'1px solid rgba(255,215,0,0.2)', pointerEvents:'none', zIndex:10 }} />

      <div style={{ maxWidth:520, width:'100%', textAlign:'center', position:'relative', zIndex:5 }}>
        {/* Live dot */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:20 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#AA2DFF', boxShadow:'0 0 10px #AA2DFF', animation:'csGlow 1.6s ease-in-out infinite', display:'inline-block' }} />
          <span style={{ fontSize:8, fontWeight:900, letterSpacing:'0.3em', color:'#AA2DFF' }}>LOADING THE INDEX</span>
        </div>

        {/* Logo */}
        <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:160, height:160, borderRadius:'50%', background:'#1C0A3E', border:'3px solid #FFD700', boxShadow:'0 0 0 5px #6D28D9, 0 0 32px rgba(255,215,0,0.3)', marginBottom:28, animation:'csPulse 3s ease-in-out infinite' }}>
          <div style={{ fontSize:8, fontWeight:900, letterSpacing:'0.18em', color:'rgba(255,255,255,0.5)' }}>THE</div>
          <div style={{ fontSize:20, fontWeight:900, letterSpacing:'0.15em', color:'#fff', lineHeight:1, textShadow:'0 0 16px rgba(255,215,0,0.5)' }}>MUSICIANS</div>
          <div style={{ fontSize:22, fontWeight:900, letterSpacing:'0.2em', color:'#fff', lineHeight:1, textShadow:'0 0 16px rgba(255,215,0,0.5)' }}>INDEX</div>
          <div style={{ fontSize:7, fontWeight:900, letterSpacing:'0.22em', color:'rgba(255,215,0,0.7)', marginTop:4 }}>COMING SOON</div>
        </div>

        <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.4rem)', fontWeight:900, margin:'0 0 12px', letterSpacing:'-0.01em', background:'linear-gradient(135deg,#AA2DFF,#00FFFF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          Something big is loading.
        </h1>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7, margin:'0 0 32px' }}>
          The arena is being prepared.<br />Artists are warming up. Battles are forming.<br />The Index drops soon.
        </p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/auth" style={{ padding:'11px 24px', fontSize:10, fontWeight:900, letterSpacing:'0.14em', background:'linear-gradient(135deg,#AA2DFF,#6D28D9)', color:'#fff', borderRadius:8, textDecoration:'none' }}>
            GET EARLY ACCESS →
          </Link>
          <a href="mailto:berntmusic33@gmail.com" style={{ padding:'11px 24px', fontSize:10, fontWeight:900, letterSpacing:'0.14em', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, textDecoration:'none' }}>
            CONTACT
          </a>
        </div>
      </div>

      {/* Scrolling hype ticker */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:22, background:'rgba(0,0,0,0.6)', borderTop:'1px solid rgba(255,215,0,0.2)', overflow:'hidden', display:'flex', alignItems:'center' }}>
        <div style={{ display:'flex', whiteSpace:'nowrap', animation:'csTicker 40s linear infinite' }}>
          {[0,1].map(r => (
            <span key={r} style={{ display:'inline-flex', alignItems:'center', gap:0 }}>
              {['THE MUSICIAN\'S INDEX IS COMING','⚡','BATTLES','⚡','RANKINGS','⚡','LIVE ARENA','⚡','CYPHERS','⚡','YOUR MOMENT IS NEAR','⚡'].map((t,i) => (
                <span key={i} style={{ paddingLeft:32, paddingRight:8, fontSize:8, fontWeight:900, letterSpacing:'0.12em', color: t === '⚡' ? '#FFD700' : 'rgba(255,255,255,0.5)' }}>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
