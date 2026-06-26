import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (<div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />);
}

function SkeletonRepeater({ count = 1, className, children }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        typeof children === "function" ? children(i) : <Skeleton key={i} className={className} />
      ))}
    </>
  );
}

export { Skeleton, SkeletonRepeater }
