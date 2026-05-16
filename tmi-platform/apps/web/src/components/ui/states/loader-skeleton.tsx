type LoaderSkeletonProps = {
  count?: number;
  height?: string;
};

export function LoaderSkeleton({ count = 1, height = "h-16" }: LoaderSkeletonProps) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: Math.max(1, count) }).map((_, index) => (
        <div key={index} className={`w-full animate-pulse rounded-lg bg-zinc-800/60 ${height}`} />
      ))}
    </div>
  );
}

export default LoaderSkeleton;
