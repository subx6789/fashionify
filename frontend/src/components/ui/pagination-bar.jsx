import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Responsive ecommerce pagination bar.
 * Shows: Prev | 1 2 3 … n | Next
 * Active page is highlighted. Max 5 page buttons shown with ellipsis.
 */
function PaginationBar({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const WINDOW = 2; // pages around current

  for (let i = 0; i < totalPages; i++) {
    if (
      i === 0 ||
      i === totalPages - 1 ||
      (i >= currentPage - WINDOW && i <= currentPage + WINDOW)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
      {/* Prev */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 px-3 gap-1"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </Button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page + 1}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
              page === currentPage
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "hover:bg-muted text-foreground"
            }`}
          >
            {page + 1}
          </button>
        )
      )}

      {/* Next */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 px-3 gap-1"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default PaginationBar;
