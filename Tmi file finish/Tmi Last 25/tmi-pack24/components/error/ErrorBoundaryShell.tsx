'use client';
// ErrorBoundaryShell.tsx — Catches component errors without killing the page
// Copilot wires: wrap any risky component, log to Sentry on catch
// Proof: wrapped component error shows fallback, not blank/white page
import { Component, ReactNode } from 'react';
interface Props { children: ReactNode; fallback?: ReactNode; label?: string; }
interface State { hasError: boolean; }
export class ErrorBoundaryShell extends Component<Props, State> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    // Copilot: log to Sentry here
    console.error('[ErrorBoundary]', this.props.label, error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="tmi-error-boundary" role="alert">
          <span className="tmi-error-boundary__msg">
            {this.props.label || 'This section'} is temporarily unavailable
          </span>
          <button className="tmi-btn-ghost tmi-btn--sm" onClick={() => this.setState({hasError:false})}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
