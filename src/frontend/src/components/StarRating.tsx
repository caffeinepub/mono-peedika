import { cn } from "@/lib/utils";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  className,
}: StarRatingProps) {
  const sizeClass = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  const textClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i + 1 <= Math.floor(rating);
    const half = !filled && i < rating;
    return { filled, half, key: `star-${i}` };
  });

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <span key={star.key} className="text-accent">
            {star.filled ? (
              <Star className={cn(sizeClass, "fill-current")} />
            ) : star.half ? (
              <StarHalf className={cn(sizeClass, "fill-current")} />
            ) : (
              <Star
                className={cn(
                  sizeClass,
                  "fill-muted stroke-muted-foreground/30",
                )}
              />
            )}
          </span>
        ))}
      </div>
      <span
        className={cn(textClass, "font-semibold text-foreground tabular-nums")}
      >
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={cn(textClass, "text-muted-foreground")}>
          ({reviewCount.toLocaleString("en-IN")})
        </span>
      )}
    </div>
  );
}
