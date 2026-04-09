import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";

export const RatingIcons = ({
  rating,
  className,
}: {
  rating: number | null;
  className?: string;
}) => {
  if (rating === null || rating < 1 || rating > 5) {
    return "Unrated";
  }

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={cn(i + 1 <= rating && "fill-foreground", className)}
        />
      ))}
      <span className="sr-only">{rating} out of 5</span>
    </div>
  );
};
