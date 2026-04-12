'use client';

import roomStyles from '@/styles/home/rooms.module.css';
import HomeCard, { CardBody, CardHeader } from './HomeCard';

interface HomeStatCardProps {
  title: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  span?: number;
  variant?: 'stats' | 'analytics' | 'campaign' | 'botStatus';
}

/**
 * HomeStatCard — compact KPI card with optional delta trend.
 */
export default function HomeStatCard({
  title,
  value,
  delta,
  trend = 'neutral',
  span = 3,
  variant = 'stats',
}: Readonly<HomeStatCardProps>) {
  let deltaClassName = roomStyles.metricDelta;
  if (trend === 'up') {
    deltaClassName = `${roomStyles.metricDelta} ${roomStyles.metricDeltaUp}`;
  } else if (trend === 'down') {
    deltaClassName = `${roomStyles.metricDelta} ${roomStyles.metricDeltaDown}`;
  }

  return (
    <HomeCard span={span} variant={variant} title={title}>
      <CardHeader>
        <span className={roomStyles.label}>{title}</span>
      </CardHeader>
      <CardBody>
        <div className={roomStyles.metricValue}>{value}</div>
        {delta ? <span className={deltaClassName}>{delta}</span> : null}
      </CardBody>
    </HomeCard>
  );
}
