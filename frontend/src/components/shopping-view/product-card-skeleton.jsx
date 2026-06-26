/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: product-card-skeleton.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 1
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

/**
 * Skeleton loader for ShoppingProductTile — exact dimensions to prevent layout shift.
 */
function ProductCardSkeleton() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <SkeletonTheme
      baseColor={isDark ? "#1f2937" : "#f3f4f6"}
      highlightColor={isDark ? "#374151" : "#e5e7eb"}
    >
      <div className="rounded-xl overflow-hidden border border-border bg-card">
        {/* Image placeholder */}
        <Skeleton height={260} className="block" />
        <div className="p-4 space-y-2">
          {/* Tags */}
          <div className="flex gap-1">
            <Skeleton width={56} height={18} borderRadius={99} />
            <Skeleton width={72} height={18} borderRadius={99} />
          </div>
          {/* Title */}
          <Skeleton height={16} width="80%" />
          <Skeleton height={16} width="60%" />
          {/* Price */}
          <div className="flex items-center gap-2 pt-1">
            <Skeleton height={20} width={64} />
            <Skeleton height={16} width={48} />
          </div>
          {/* Button */}
          <Skeleton height={36} borderRadius={8} className="mt-2" />
        </div>
      </div>
    </SkeletonTheme>
  );
}


export default ProductCardSkeleton;
