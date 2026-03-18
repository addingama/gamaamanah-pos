"use client";

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="w-full">
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-zinc-100" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100" />
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="w-40">
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
              <div className="mt-2 h-7 w-full animate-pulse rounded bg-zinc-100" />
            </div>
            <div className="w-24">
              <div className="h-3 w-12 animate-pulse rounded bg-zinc-100" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

