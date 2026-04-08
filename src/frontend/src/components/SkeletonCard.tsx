import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted/50 rounded", className)} />;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card border border-border/50 overflow-hidden",
        className,
      )}
    >
      <Shimmer className="aspect-square w-full rounded-none" />
      <div className="p-3 flex flex-col gap-2">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-3 w-3/4" />
        <div className="flex gap-1 mt-1">
          {["s1", "s2", "s3", "s4", "s5"].map((k) => (
            <Shimmer key={k} className="h-3 w-3 rounded-full" />
          ))}
          <Shimmer className="h-3 w-8 ml-1" />
        </div>
        <Shimmer className="h-5 w-24 mt-1" />
        <Shimmer className="h-9 w-full mt-2 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 8,
  className,
}: { count?: number; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
        className,
      )}
    >
      {Array.from({ length: count }, (_, i) => `sk-${i}`).map((k) => (
        <SkeletonCard key={k} />
      ))}
    </div>
  );
}
