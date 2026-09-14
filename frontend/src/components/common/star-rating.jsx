/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: star-rating.jsx
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

import { StarIcon } from "lucide-react";
import { Button } from "../ui/button";

function StarRatingComponent({ rating, handleRatingChange, size = "md" }) {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  const btnSize = size === "sm" ? "w-4 h-4 p-0" : handleRatingChange ? "p-2" : "w-5 h-5 p-0";

  return [1, 2, 3, 4, 5].map((star) => (
    <Button
      key={star}
      className={`${btnSize} rounded-full transition-colors ${star <= rating
        ? "text-yellow-500 hover:bg-yellow-500/10"
        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
        }`}
      variant="ghost"
      size="icon"
      onClick={handleRatingChange ? () => handleRatingChange(star) : null}
      disabled={!handleRatingChange}
    >
      <StarIcon
        className={`${iconSize} ${star <= rating ? "fill-yellow-500 text-yellow-500" : "fill-transparent text-muted-foreground"
          }`}
      />
    </Button>
  ));
}

export default StarRatingComponent;
