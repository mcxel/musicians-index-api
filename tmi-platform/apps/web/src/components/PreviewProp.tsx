"use client";

import React, { useEffect, useState } from "react";
import { PropEffects } from "./PropEffects";

export function PreviewProp() {
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('previewAvatar');
      if (raw) {
        const parsed = JSON.parse(raw);
        setPreview(parsed?.equipped || null);
      }
    } catch (e) {}
  }, []);

  const equippedProp = preview?.prop || null;

  if (!equippedProp) return null;

  return <PropEffects equippedProp={equippedProp} small={true} active={true} />;
}
