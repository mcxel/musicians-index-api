import type { ReactNode } from 'react';
import GlowFrame from '@/components/home/shared/GlowFrame';
import SectionTitle from '@/components/ui/SectionTitle';
import type { HomeBeltAccent } from './types';
import beltStyles from '@/styles/home/belt.module.css';

interface HomepageBeltProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  accent?: HomeBeltAccent;
  chrome?: boolean;
}

export default function HomepageBelt({
  children,
  title,
  subtitle,
  badge,
  accent = 'cyan',
  chrome = true,
}: Readonly<HomepageBeltProps>) {
  if (!chrome) {
    return <section className={beltStyles.beltBare}>{children}</section>;
  }

  return (
    <GlowFrame accent={accent}>
      <section className={beltStyles.beltInner}>
        {title ? <SectionTitle title={title} subtitle={subtitle} badge={badge} accent={accent} /> : null}
        {children}
      </section>
    </GlowFrame>
  );
}