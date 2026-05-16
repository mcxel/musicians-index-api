"use client";

type SparkleLayerProps = {
  seed?: number;
};

const SPARKLE_COUNT = 14;

function buildSparkles(seed = 1) {
  return Array.from({ length: SPARKLE_COUNT }).map((_, i) => {
    const offset = i + seed;
    return {
      id: `sparkle-${i}`,
      left: `${(offset * 13) % 100}%`,
      top: `${(offset * 17) % 100}%`,
      delay: `${(offset % 7) * 0.6}s`,
      duration: `${5 + (offset % 5)}s`
    };
  });
}

export default function SparkleLayer({ seed = 1 }: SparkleLayerProps) {
  const sparkles = buildSparkles(seed);

  return (
    <div className="sparkle-layer" aria-hidden>
      {sparkles.map(sparkle => (
        <span
          key={sparkle.id}
          className="sparkle-layer__dot"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration
          }}
        />
      ))}
    </div>
  );
}
