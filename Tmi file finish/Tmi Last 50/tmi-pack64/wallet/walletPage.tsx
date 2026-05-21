// apps/web/src/app/wallet/page.tsx — Wallet & Earnings Page
"use client";
import Link from "next/link";
const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",teal2:"#00C896",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

const MOCK_TRANSACTIONS = [
  { type:"EARNING_TIP",    label:"Tip from FanB",           amountCents:500,  pts:0,  time:"Today 9:04pm",  status:"settled"  },
  { type:"EARNING_TICKET", label:"Ticket: Friday Show",     amountCents:1500, pts:0,  time:"Today 8:00pm",  status:"pending"  },
  { type:"POINTS_AWARD",   label:"Live stream bonus",        amountCents:0,    pts:50, time:"Today 7:30pm",  status:"settled"  },
  { type:"EARNING_SPONSOR",label:"Sponsor task: LocalCo",   amountCents:2000, pts:25, time:"Yesterday",     status:"pending"  },
  { type:"PAYOUT_SENT",    label:"Weekly payout",           amountCents:-4800,pts:0,  time:"Mon 8:00am",   status:"settled"  },
];

export default function WalletPage() {
  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      <div style={{ background:"#150830", borderBottom:`1px solid ${T.gold}33`, padding:"14px 20px", display:"flex", alignItems:"center", gap:10 }}>
        <Link href="/dashboard/artist" style={{ color:T.text3, textDecoration:"none", fontFamily:T.heading, fontSize:11 }}>← BACK</Link>
        <div style={{ fontFamily:T.display, fontSize:20, color:T.gold, letterSpacing:2 }}>MY WALLET</div>
      </div>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 16px" }}>

        {/* Balance cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          <div style={{ background:`linear-gradient(135deg,${T.gold}22,${T.card})`, border:`2px solid ${T.gold}`, borderRadius:12, padding:16, gridColumn:"span 2" }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3, letterSpacing:1, marginBottom:4 }}>AVAILABLE BALANCE</div>
            <div style={{ fontFamily:T.display, fontSize:40, color:T.gold }}>$48.00</div>
            <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3, marginTop:4 }}>Pending: $35.00 · Requires Big Ace approval before payout</div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, letterSpacing:1 }}>POINTS</div>
            <div style={{ fontFamily:T.display, fontSize:28, color:T.purple }}>1,850</div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.teal}44`, borderRadius:10, padding:12 }}>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3, letterSpacing:1 }}>LIFETIME EARNED</div>
            <div style={{ fontFamily:T.display, fontSize:28, color:T.teal }}>$312</div>
          </div>
        </div>

        {/* Payout CTA */}
        <div style={{ background:T.card, border:`1px solid ${T.gold}33`, borderRadius:10, padding:14, marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:T.heading, fontSize:10, color:T.text, marginBottom:2 }}>Ready to get paid?</div>
            <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>Payouts processed weekly · Big Ace reviews all requests · $25 minimum</div>
          </div>
          <button style={{ padding:"8px 16px", background:T.gold, border:"none", borderRadius:8, fontFamily:T.heading, fontSize:10, color:"#0D0520", cursor:"pointer", letterSpacing:1, whiteSpace:"nowrap" }}>REQUEST PAYOUT</button>
        </div>

        {/* Transaction history */}
        <div style={{ fontFamily:T.display, fontSize:18, color:T.gold, letterSpacing:2, marginBottom:10 }}>TRANSACTION HISTORY</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {MOCK_TRANSACTIONS.map((tx,i) => (
            <div key={i} style={{ background:T.card, border:`1px solid ${T.text3}22`, borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:tx.status==="settled"?T.teal2:T.amber, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:T.heading, fontSize:10, color:T.text }}>{tx.label}</div>
                <div style={{ fontFamily:T.heading, fontSize:8, color:T.text3 }}>{tx.time} · {tx.status}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                {tx.amountCents !== 0 && <div style={{ fontFamily:T.display, fontSize:16, color:tx.amountCents>0?T.teal2:T.pink }}>{tx.amountCents>0?"+":" "}{(tx.amountCents/100).toFixed(2)}</div>}
                {tx.pts !== 0 && <div style={{ fontFamily:T.heading, fontSize:9, color:T.purple }}>+{tx.pts} pts</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Points redemption section */}
        <div style={{ marginTop:20, background:T.card, border:`1px solid ${T.purple}44`, borderRadius:10, padding:14 }}>
          <div style={{ fontFamily:T.display, fontSize:16, color:T.purple, letterSpacing:1, marginBottom:8 }}>REDEEM POINTS</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[["500 pts","Avatar item",T.purple],["250 pts","Profile badge",T.cyan],["1000 pts","Sponsor slot boost",T.gold],["100 pts","Entry ticket",T.pink]].map(([pts,item,color])=>(
              <div key={pts as string} style={{ background:T.raised, border:`1px solid ${color as string}33`, borderRadius:6, padding:10 }}>
                <div style={{ fontFamily:T.display, fontSize:16, color:color as string }}>{pts}</div>
                <div style={{ fontFamily:T.heading, fontSize:9, color:T.text2 }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
