"use client";

import { useState, useRef, useCallback } from "react";

export interface InteractiveStarRatingProps {
  value: number | null;       // current confirmed rating (1-10), null = unrated
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;         // if true, clicking shows onDisabledClick instead of editing
  onDisabledClick?: () => void; // called when disabled and user tries to interact
}

const STARS = 5;
// Each star = 2 points on the 1-10 scale
// Half-star = 1 point
// Hovering left-half of star i → rating = i*2 - 1
// Hovering right-half of star i → rating = i*2

const sizeMap = {
  sm: { star: 16, gap: 4 },
  md: { star: 22, gap: 6 },
  lg: { star: 28, gap: 6 },
};

export function InteractiveStarRating({
  value,
  onChange,
  size = "md",
  className = "",
  disabled = false,
  onDisabledClick,
}: InteractiveStarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  // Only start in editing mode if unrated AND not disabled
  const [isEditing, setIsEditing] = useState(value === null && !disabled);
  const containerRef = useRef<HTMLDivElement>(null);

  const { star: starSize, gap } = sizeMap[size];

  // Active display rating: hover preview, or confirmed value, or 0
  const displayRating = hoverRating ?? value ?? 0;

  // Convert internal 1-10 rating to star fill fractions per star
  // star index 0..4 → fill 0..1
  function starFill(starIndex: number): number {
    const starValue = displayRating / 2; // convert to 0-5 star scale
    const fill = starValue - starIndex;
    return Math.min(Math.max(fill, 0), 1);
  }

  function getRatingFromPosition(e: React.MouseEvent<HTMLDivElement>, starIndex: number): number {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    // Left half = half star (odd number), right half = full star (even number)
    return isLeftHalf ? starIndex * 2 + 1 : starIndex * 2 + 2;
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (disabled || !isEditing) return;
    setHoverRating(getRatingFromPosition(e, starIndex));
  }, [isEditing, disabled]);

  const handleMouseLeave = useCallback(() => {
    setHoverRating(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    // If disabled, show auth modal instead
    if (disabled) {
      onDisabledClick?.();
      return;
    }
    const rating = getRatingFromPosition(e, starIndex);
    onChange(rating);
    setIsEditing(false);
    setHoverRating(null);
  }, [onChange, disabled, onDisabledClick]);

  // Keyboard: arrow keys to adjust rating
  function handleKeyDown(e: React.KeyboardEvent) {
    // If disabled, show auth modal on Enter/Space
    if (disabled) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onDisabledClick?.();
      }
      return;
    }
    if (!isEditing) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsEditing(true); }
      return;
    }
    const current = hoverRating ?? value ?? 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setHoverRating(Math.min(current + 1, 10));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setHoverRating(Math.max(current - 1, 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (current > 0) { onChange(current); setIsEditing(false); setHoverRating(null); }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setHoverRating(null);
    }
  }

  const activeRating = hoverRating ?? value;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Stars row */}
      <div
        ref={containerRef}
        role="slider"
        aria-label="Ma note"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value ?? 0}
        aria-valuetext={value ? `${value} sur 10` : "Non noté"}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseLeave={handleMouseLeave}
        className={`flex outline-none ${isEditing ? "cursor-pointer" : "cursor-default"}`}
        style={{ gap: `${gap}px` }}
      >
        {Array.from({ length: STARS }).map((_, i) => {
          const fill = starFill(i);
          const isHalf = fill > 0 && fill < 1;
          const isFull = fill === 1;

          return (
            <div
              key={i}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onClick={(e) => (disabled || isEditing) && handleClick(e, i)}
              style={{ width: starSize, height: starSize, position: "relative" }}
            >
              {/* Background star (empty) */}
              <svg
                width={starSize}
                height={starSize}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  stroke={isEditing ? "#e85d04" : (value ? "#e85d04" : "#d1d1d1")}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  fill="transparent"
                />
              </svg>

              {/* Filled portion (clip to fill%) */}
              {fill > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${fill * 100}%`,
                    overflow: "hidden",
                  }}
                >
                  <svg
                    width={starSize}
                    height={starSize}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill="#e85d04"
                      stroke="#e85d04"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score label + edit toggle */}
      <div className="flex items-center gap-3">
        <span
          className={`text-t2 font-semibold tracking-tight transition-colors ${
            activeRating ? "text-primary" : "text-gray/40"
          }`}
        >
          {activeRating ? `${activeRating}/10` : "—"}
        </span>

        {!isEditing && value !== null && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[11px] font-medium text-gray hover:text-primary transition-colors underline underline-offset-2"
            aria-label="Modifier ma note"
          >
            modifier
          </button>
        )}

        {isEditing && value !== null && (
          <button
            onClick={() => { setIsEditing(false); setHoverRating(null); }}
            className="text-[11px] font-medium text-gray hover:text-dark transition-colors"
            aria-label="Annuler la modification"
          >
            annuler
          </button>
        )}
      </div>

      {isEditing && (
        <p className="text-[11px] text-gray/60 font-medium" aria-live="polite">
          {hoverRating
            ? `${hoverRating}/10 — cliquez pour confirmer`
            : "Glissez pour noter, ← → au clavier"}
        </p>
      )}
    </div>
  );
}
