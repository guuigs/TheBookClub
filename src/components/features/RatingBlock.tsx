"use client";

import { RatingStars, Button } from "@/components/ui";

export interface RatingBlockProps {
  averageRating: number; // 1-10
  totalVotes: number;
  ratingDistribution: number[]; // Array of 10 values (index 0 = votes for 1, etc.)
  onRateClick?: () => void;
  className?: string;
}

export function RatingBlock({
  averageRating,
  totalVotes,
  ratingDistribution,
  onRateClick,
  className = "",
}: RatingBlockProps) {
  // Find the max value for scaling the histogram
  const maxVotes = Math.max(...ratingDistribution, 1);

  return (
    <div className={`flex flex-col gap-5 w-full ${className}`}>
      {/* Score Display */}
      <p className="text-t2 font-semibold text-dark tracking-tight">
        {averageRating}/10
      </p>

      {/* Stars */}
      <div className="flex flex-col gap-3">
        <RatingStars rating={averageRating} size="lg" />
        <p className="text-body font-medium text-primary tracking-tight">
          {totalVotes} votant{totalVotes > 1 ? "s" : ""}
        </p>
      </div>

      {/* Separator */}
      <div className="w-full h-px bg-gray/30" />

      {/* Vote Distribution Histogram */}
      <div className="flex flex-col gap-2.5 w-full">
        <p className="text-small font-medium text-dark text-center tracking-tight">
          Répartition des votes
        </p>

        {/* Histogram Bars */}
        <div
          className="flex items-end justify-between w-full h-[44px]"
          role="img"
          aria-label={`Répartition des votes : ${ratingDistribution.map((v, i) => `note ${i + 1} : ${v} vote${v > 1 ? "s" : ""}`).join(", ")}`}
        >
          {ratingDistribution.map((votes, index) => {
            const height = (votes / maxVotes) * 44;
            return (
              <div
                key={index}
                className="w-[20px] bg-primary rounded-t-sm transition-all hover:opacity-80"
                style={{ height: `${Math.max(height, 2)}px` }}
                aria-hidden="true"
              />
            );
          })}
        </div>

        {/* Rating Labels */}
        <div className="flex items-center justify-between w-full">
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className="w-[20px] text-center text-[8px] font-medium text-dark"
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Rate Button */}
      {onRateClick && (
        <Button variant="primary" size="md" onClick={onRateClick}>
          Noter ce livre
        </Button>
      )}
    </div>
  );
}
