"use client";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warn: (msg: string) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS: Record<ToastType, string>   = { success:"✅", error:"❌", info:"ℹ️", warning:"⚠️" };
const COLORS: Record<ToastType, string>  = { success:"#00FF88", error:"#FF5555", info:"#00FFFF", warning:"#FFD700" };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 3500) => {
    const id = `toast-${++counter.current}`;
    setToasts(ts => [...ts, { id, type, message, duration }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const ctx: ToastContextValue = {
    toast,
    success: (msg) => toast(msg, "success"),
    error:   (msg) => toast(msg, "error"),
    info:    (msg) => toast(msg, "info"),
    warn:    (msg) => toast(msg, "warning"),
  };

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div role="region" aria-live="polite" aria-label="Notifications"
        style={{ position:"fixed", bottom:20, right:20, zIndex:2000, display:"flex", flexDirection:"column-reverse", gap:8, pointerEvents:"none" }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ opacity:0, x:60, scale:0.95 }}
              animate={{ opacity:1, x:0, scale:1 }}
              exit={{ opacity:0, x:60, scale:0.95 }}
              role="alert"
              style={{ pointerEvents:"auto", display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:"#0d0e1c", border:`1px solid ${COLORS[t.type]}30`, borderRadius:9, boxShadow:"0 4px 24px rgba(0,0,0,0.5)", minWidth:240, maxWidth:360 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{ICONS[t.type]}</span>
              <span style={{ flex:1, fontSize:11, color:"rgba(255,255,255,0.85)", lineHeight:1.4 }}>{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification"
                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:14, padding:"0 2px", flexShrink:0 }}>✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
