import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-muted" />
      <div className="mt-4 flex gap-2">
        <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
