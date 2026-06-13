'use client';

import React from 'react';

interface MediaFallbackProps {
  liveStreamUrl?: string | null;
  humanUploadedUrl?: string | null;
  approvedGeneratedUrl?: string | null;
  botGeneratedUrl?: string | null;
  profileFallbackUrl?: string | null;
  genreDefaultUrl?: string | null;
  altText: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Implements the Platform Content Display Law:
 * Human Upload > Human Approved Generated > Bot Generated > Genre Default
 * (Live Streams supersede all if active).
 */
export default function MediaFallbackResolver({
  liveStreamUrl,
  humanUploadedUrl,
  approvedGeneratedUrl,
  botGeneratedUrl,
  profileFallbackUrl,
  genreDefaultUrl,
  altText,
  className,
  style
}: MediaFallbackProps) {
  
  // Hierarchy Engine Evaluation
  const resolvedSource = 
    liveStreamUrl || 
    humanUploadedUrl || 
    approvedGeneratedUrl || 
    botGeneratedUrl || 
    profileFallbackUrl || 
    genreDefaultUrl || 
    '/assets/placeholders/tmi-default-grid.png'; // Ultimate baseline

  return (
    <img 
      src={resolvedSource} 
      alt={altText}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      loading="lazy"
    />
  );
}