// Loading placeholders. Match the shape of the real content so the layout does
// not jump when data arrives.

export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={`block animate-pulse rounded-md bg-sunken ${className}`}
        />
    );
}

/** A single line of text. `w` sets the width, e.g. "w-32". */
export function SkeletonText({ className = "w-32" }: { className?: string }) {
    return <Skeleton className={`h-4 ${className}`} />;
}

/** A card-shaped block, for stat cards and panels. */
export function SkeletonCard({ className = "h-32" }: { className?: string }) {
    return <Skeleton className={`rounded-xl ${className}`} />;
}

/** Table/list rows: a stack of lines. */
export function SkeletonRows({
    rows = 5,
    className = "",
}: {
    rows?: number;
    className?: string;
}) {
    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}
