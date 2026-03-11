"use client";

import { Star } from "lucide-react";
import { useState } from "react";

export interface RatingStarsProps {
  rating: number; // 0-10 scale
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  variant?: "default" | "light";
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function RatingStars({
  rating,
  maxRating = 10,
  size = "md",
  interactive = false,
  variant = "default",
  onRatingChange,
  className = "",
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Convert 10-scale rating to 5-star display
  const starsCount = 5;
  const starValue = maxRating / starsCount; // Each star represents 2 points
  const displayRating = hoverRating ?? rating;
  const filledStars = displayRating / starValue;

  // Color variants
  const emptyColor = variant === "light" ? "text-white/40 stroke-white/40" : "text-gray stroke-gray";
  const filledColor = variant === "light" ? "text-white fill-white" : "text-primary fill-primary";

  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      // Each star click = 2 points (starIndex + 1) * 2
      const newRating = (starIndex + 1) * starValue;
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (interactive) {
      setHoverRating((starIndex + 1) * starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: starsCount }).map((_, index) => {
        const fillPercentage = Math.min(
          Math.max((filledStars - index) * 100, 0),
          100
        );

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className={`relative ${interactive ? "cursor-pointer" : "cursor-default"} disabled:cursor-default`}
          >
            {/* Background star (empty) */}
            <Star
              className={`${sizeClasses[size]} ${emptyColor} fill-transparent`}
            />
            {/* Foreground star (filled) - clipped based on percentage */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className={`${sizeClasses[size]} ${filledColor}`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
