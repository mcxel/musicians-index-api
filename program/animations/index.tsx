// Placeholder for @program/animations
import React from 'react';

interface AnimationProps {
    children: React.ReactNode;
    [key: string]: any;
}

export const VideoFrameFX = (props: AnimationProps) => {
    return <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '1rem' }}>{props.children}</div>;
};

export const NeonPulse = (props: AnimationProps) => {
    // This component just wraps children, the real animation would be CSS based.
    return <>{props.children}</>;
};
