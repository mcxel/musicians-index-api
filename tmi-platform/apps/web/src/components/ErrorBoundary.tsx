"use client";

import React from "react";
import { logger } from '@/lib/logger';

type ErrorBoundaryProps = { children: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean };

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    logger.error('UI crashed', error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
