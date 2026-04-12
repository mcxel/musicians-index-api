"use client";

import { Component, type ErrorInfo, type ReactNode } from 'react';
import ChartBelt from '@/components/home/belts/ChartBelt';
import CrownBelt from '@/components/home/belts/CrownBelt';
import HeroBelt from '@/components/home/belts/HeroBelt';
import InterviewBelt from '@/components/home/belts/InterviewBelt';
import LiveShowsBelt from '@/components/home/belts/LiveShowsBelt';
import NewsBelt from '@/components/home/belts/NewsBelt';
import ReleasesBelt from '@/components/home/belts/ReleasesBelt';
import SponsorBelt from '@/components/home/belts/SponsorBelt';
import StoreBelt from '@/components/home/belts/StoreBelt';
import HomepageBelt from './HomepageBelt';
import type { HomeBeltComponentMap, HomeBeltDefinition } from './types';

const BELT_COMPONENTS: HomeBeltComponentMap = {
  HERO_BELT: HeroBelt,
  CROWN_BELT: CrownBelt,
  NEWS_BELT: NewsBelt,
  INTERVIEW_BELT: InterviewBelt,
  CHART_BELT: ChartBelt,
  SPONSOR_BELT: SponsorBelt,
  RELEASES_BELT: ReleasesBelt,
  LIVE_SHOWS_BELT: LiveShowsBelt,
  STORE_BELT: StoreBelt,
};

function BeltFallback({ title }: Readonly<{ title: string }>) {
  return (
    <div
      style={{
        minHeight: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        border: '1px dashed rgba(255,255,255,0.16)',
        background: 'rgba(255,255,255,0.03)',
        color: 'rgba(255,255,255,0.55)',
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {title} unavailable
    </div>
  );
}

class BeltErrorBoundary extends Component<
  { fallbackTitle: string; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallbackTitle: string; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  render() {
    if (this.state.hasError) {
      return <BeltFallback title={this.props.fallbackTitle} />;
    }

    return this.props.children;
  }
}

export default function BeltRenderer({ belts }: Readonly<{ belts: HomeBeltDefinition[] }>) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {belts.map((belt) => {
        const ComponentToRender = BELT_COMPONENTS[belt.componentKey];
        const fallbackTitle = belt.title ?? belt.id;

        return (
          <HomepageBelt
            key={belt.id}
            title={belt.title}
            subtitle={belt.subtitle}
            badge={belt.badge}
            accent={belt.accent}
            chrome={belt.chrome}
          >
            <BeltErrorBoundary fallbackTitle={fallbackTitle}>
              {ComponentToRender ? <ComponentToRender /> : <BeltFallback title={fallbackTitle} />}
            </BeltErrorBoundary>
          </HomepageBelt>
        );
      })}
    </div>
  );
}