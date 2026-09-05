"use client";

import React, { useState } from "react";

const CANONICAL_MAGAZINE_FALLBACK =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80";

export interface SafeMagazineImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function SafeMagazineImage({
  src,
  alt = "TMI Editorial Image",
  fallbackSrc = CANONICAL_MAGAZINE_FALLBACK,
  style,
  className,
  ...props
}: SafeMagazineImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      {...props}
      src={failed || !src ? fallbackSrc : src}
      alt={alt}
      className={className}
      style={{
        objectFit: "cover",
        display: "block",
        maxWidth: "100%",
        ...style,
      }}
      onError={() => setFailed(true)}
    />
  );
}

export default SafeMagazineImage;
