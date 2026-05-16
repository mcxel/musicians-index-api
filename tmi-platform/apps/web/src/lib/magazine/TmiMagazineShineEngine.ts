"use client";

import { useEffect, useState } from "react";

type ShineState = {
  logoShineActive: boolean;
  crownPulseActive: boolean;
};

export function useTmiMagazineShineEngine(): ShineState {
  const [logoShineActive, setLogoShineActive] = useState(false);
  const [crownPulseActive, setCrownPulseActive] = useState(true);

  useEffect(() => {
    const logoTimer = window.setInterval(() => {
      setLogoShineActive(true);
      window.setTimeout(() => setLogoShineActive(false), 1200);
    }, 5200 + Math.floor(Math.random() * 3000));

    const crownTimer = window.setInterval(() => {
      setCrownPulseActive((prev) => !prev);
    }, 1800);

    return () => {
      window.clearInterval(logoTimer);
      window.clearInterval(crownTimer);
    };
  }, []);

  return { logoShineActive, crownPulseActive };
}
