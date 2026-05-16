type FogGradientProps = {
  color?: string;
  opacity?: number;
};

export default function FogGradient({ color = "0,255,255", opacity = 0.16 }: FogGradientProps) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `radial-gradient(circle at 15% 15%, rgba(${color},${opacity}) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,45,170,${opacity * 0.8}) 0%, transparent 58%)`,
      }}
    />
  );
}