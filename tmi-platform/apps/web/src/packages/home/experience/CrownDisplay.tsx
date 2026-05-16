"use client";

type CrownDisplayProps = {
  artist?: string;
  subtitle?: string;
};

export default function CrownDisplay({
  artist = "Ray Journey",
  subtitle = "Current #1 Crown Holder"
}: CrownDisplayProps) {
  return (
    <section className="crown-display crown-pulse" aria-label="Crown Display">
      <p className="crown-display__kicker">Crown</p>
      <h3 className="crown-display__artist">{artist}</h3>
      <p className="crown-display__subtitle">{subtitle}</p>
    </section>
  );
}
