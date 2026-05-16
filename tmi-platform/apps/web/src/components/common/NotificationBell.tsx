"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Notification {
  id: string;
  message: string;
  href: string;
  read: boolean;
  createdAt: number;
}

export default function NotificationBell() {
  const [count,   setCount]   = useState(0);
  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/metrics")
      .then(r => r.json())
      .then((d: unknown) => {
        const data = d as { notifications?: Notification[]; unreadCount?: number };
        if (data.notifications) setNotifs(data.notifications);
        if (typeof data.unreadCount === "number") setCount(data.unreadCount);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <motion.button
        whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
        onClick={() => setOpen(o => !o)}
        aria-label={`${count} notifications`}
        style={{ position:"relative", background:"none", border:"none", cursor:"pointer", padding:6, fontSize:18, lineHeight:1 }}>
        🔔
        {count > 0 && (
          <motion.span
            initial={{ scale:0 }} animate={{ scale:1 }}
            style={{ position:"absolute", top:-2, right:-2, width:16, height:16, background:"#FF3C3C", borderRadius:"50%", fontSize:8, fontWeight:900, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            style={{ position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:200, background:"#0a0b18", border:"1px solid rgba(255,255,255,0.10)", borderRadius:10, padding:"8px 0", minWidth:280, maxHeight:360, overflowY:"auto", boxShadow:"0 8px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ padding:"8px 14px 6px", fontSize:7, letterSpacing:"0.18em", color:"rgba(255,255,255,0.3)", fontWeight:700, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>NOTIFICATIONS</div>
            {notifs.length === 0 ? (
              <div style={{ padding:"20px 14px", textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.25)" }}>All caught up ✓</div>
            ) : notifs.slice(0,10).map(n => (
              <Link key={n.id} href={n.href} onClick={() => setOpen(false)}
                style={{ display:"block", padding:"10px 14px", fontSize:11, color: n.read ? "rgba(255,255,255,0.45)" : "#fff", background: n.read ? "none" : "rgba(0,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.05)", textDecoration:"none" }}>
                {!n.read && <span style={{ display:"inline-block", width:6, height:6, background:"#00FFFF", borderRadius:"50%", marginRight:7, verticalAlign:"middle" }} />}
                {n.message}
              </Link>
            ))}
            <div style={{ padding:"8px 14px 4px", textAlign:"center" }}>
              <Link href="/notifications" onClick={() => setOpen(false)} style={{ fontSize:9, color:"#00FFFF" }}>View all</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
