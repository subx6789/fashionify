import { StarIcon } from "lucide-react";
import { Button } from "../ui/button";

function StarRatingComponent({ rating, handleRatingChange }) {
  console.log(rating, "rating");

  return [1, 2, 3, 4, 5].map((star) => (
    <Button
      key={star}
      className={`p-2 rounded-full transition-colors ${star <= rating
        ? "text-yellow-500 hover:bg-yellow-500/10"
        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
        }`}
      variant="ghost"
      size="icon"
      onClick={handleRatingChange ? () => handleRatingChange(star) : null}
      disabled={!handleRatingChange}
    >
      <StarIcon
        className={`w-5 h-5 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "fill-transparent text-muted-foreground"
          }`}
      />
    </Button>
  ));
}

export default StarRatingComponent;
