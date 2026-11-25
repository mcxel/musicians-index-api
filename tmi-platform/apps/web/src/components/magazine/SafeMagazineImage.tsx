"use client";

import React, { useState } from "react";

/** Platform placeholder only — never Unsplash/stock presented as performer photography. */
const CANONICAL_MAGAZINE_FALLBACK = "/images/tmi-placeholder.jpg";

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
