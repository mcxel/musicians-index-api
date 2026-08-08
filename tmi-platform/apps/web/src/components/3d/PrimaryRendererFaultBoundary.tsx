"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * PrimaryRendererFaultBoundary
 *
 * Fault isolation boundary for 3D/WebGL renderers, Canvas components,
 * and PrimaryRenderer instances. Ensures decorative 3D failures can NEVER
 * cause a global SYSTEM INTERRUPT crash on the dashboard.
 */
export default class PrimaryRendererFaultBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || "Renderer fault detected",
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("[PrimaryRendererFaultBoundary] Suppressed 3D renderer exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: 180,
            background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(0,0,0,0.95))",
            border: "1px solid rgba(0,255,255,0.2)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            boxSizing: "border-box",
            textAlign: "center",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.15em", marginBottom: 6 }}>
            AWR STAGE FALLBACK · {this.props.fallbackLabel ?? "3D ENVIRONMENT"}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            {this.state.errorMessage}
          </p>
          <div style={{ marginTop: 12, fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
            2D VENUE AMBIENT MODE ACTIVE
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
