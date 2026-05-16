type NeonFrameSize = "small" | "medium" | "large" | "tall" | "wide";

type NeonFrameProps = {
  children: React.ReactNode;
  size?: NeonFrameSize;
  className?: string;
};

const sizeClasses: Record<NeonFrameSize, string> = {
  small: "p-2",
  medium: "p-4",
  large: "p-6",
  tall: "p-4 min-h-full",
  wide: "p-4 w-full",
};

export default function NeonFrame({
  children,
  size = "medium",
  className,
}: NeonFrameProps) {
  return (
    <div
      className={[
        "relative rounded-2xl border border-cyan-400/30 bg-black/50 shadow-[0_0_20px_rgba(0,255,255,0.25),0_0_40px_rgba(0,255,255,0.15)] backdrop-blur-xl",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
