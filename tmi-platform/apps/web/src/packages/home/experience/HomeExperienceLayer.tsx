"use client";

import { useState } from "react";
import SparkleLayer from "@/components/effects/SparkleLayer";
import CrownDisplay from "./CrownDisplay";
import Top10Rotator from "./Top10Rotator";

export default function HomeExperienceLayer() {
  const [sparkleSeed, setSparkleSeed] = useState(1);

  return (
    <section className="home-experience-layer" aria-label="Home Experience Layer">
      <SparkleLayer seed={sparkleSeed} />
      <div className="home-experience-layer__content">
        <CrownDisplay />
        <Top10Rotator onGenreChange={() => setSparkleSeed(prev => prev + 1)} />
      </div>
    </section>
  );
}
