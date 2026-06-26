/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: skeleton.jsx
 * Purpose: Reusable UI component (Shadcn/Custom) for consistent design.
 * Functions/Methods: 2
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

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
