// Placeholder for @program/sponsors/components
import React from 'react';

interface DummySponsorProps {
    className?: string;
    fallbackLabel?: string;
    children?: React.ReactNode;
    [key: string]: any; // Allow other props
}

interface DummyBadgeProps {
    presentedByText?: string;
    children?: React.ReactNode;
    [key: string]: any; // Allow other props
}

// A dummy component that accepts className and other props
const DummySponsor = (props: DummySponsorProps) => {
  return (
    <div className={props.className} style={{ border: '1px dashed #FF6B00', padding: '1rem', color: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
      {props.fallbackLabel || 'Sponsor Placeholder'}
    </div>
  );
};

const DummyBadge = (props: DummyBadgeProps) => {
    return (
        <div style={{ border: '1px solid #FF6B00', padding: '0.5rem', color: '#FF6B00', fontSize: '0.8rem' }}>
            {props.presentedByText || 'Sponsored by Placeholder'}
        </div>
    )
}

export const SponsorTile = (props: DummySponsorProps) => <DummySponsor {...props} />;
export const SponsorStrip = (props: DummySponsorProps) => <DummySponsor {...props} />;
export const SponsorBadge = (props: DummyBadgeProps) => <DummyBadge {...props} />;
