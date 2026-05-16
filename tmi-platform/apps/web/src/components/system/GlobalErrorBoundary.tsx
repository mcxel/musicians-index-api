"use client";
import { Component, type ReactNode } from "react";
import Link from "next/link";

interface Props { children: ReactNode; fallback?: ReactNode; context?: string; }
interface State { hasError: boolean; message: string; }

export default class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError:false, message:"" };
  }

  static getDerivedStateFromError(err: Error): State {
    return { hasError:true, message: err.message };
  }

  componentDidCatch(err: Error, info: { componentStack: string }) {
    console.error(`[TMI Error Boundary — ${this.props.context ?? "unknown"}]`, err, info);
    // In production, send to error reporting (e.g. Sentry)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tmi:error", { detail: { message:err.message, context:this.props.context, stack:info.componentStack } }));
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div role="alert" style={{ textAlign:"center", padding:"32px 20px", background:"rgba(255,60,60,0.04)", border:"1px solid rgba(255,60,60,0.12)", borderRadius:10, margin:"16px 0" }}>
          <div style={{ fontSize:28, marginBottom:10 }}>⚠️</div>
          <div style={{ fontSize:12, fontWeight:800, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>
            {this.props.context ? `${this.props.context} couldn't load` : "Something went wrong"}
          </div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", marginBottom:16, fontFamily:"monospace" }}>
            {this.state.message.slice(0,120)}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => this.setState({ hasError:false, message:"" })}
              style={{ padding:"8px 16px", fontSize:9, fontWeight:800, letterSpacing:"0.12em", color:"#fff", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:6, cursor:"pointer" }}>
              TRY AGAIN
            </button>
            <Link href="/" style={{ padding:"8px 16px", fontSize:9, fontWeight:800, letterSpacing:"0.12em", color:"#050510", background:"#00FFFF", borderRadius:6, textDecoration:"none" }}>
              HOME
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
