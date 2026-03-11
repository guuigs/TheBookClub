"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button, RatingStars } from "@/components/ui";
import type { Book } from "@/types";

export interface RatingModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  initialRating?: number;
}

export function RatingModal({
  book,
  isOpen,
  onClose,
  onSubmit,
  initialRating = 0,
}: RatingModalProps) {
  const [rating, setRating] = useState(initialRating);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[400px] mx-5 p-6">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray hover:text-dark transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-t3 font-semibold text-dark">
              Noter ce livre
            </h2>
            <p className="text-body text-gray font-display">
              {book.title}
            </p>
          </div>

          {/* Rating Display */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-t1 font-semibold text-primary">
              {rating > 0 ? `${rating}/10` : "-/10"}
            </p>
            <RatingStars
              rating={rating}
              size="lg"
              interactive
              onRatingChange={setRating}
            />
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={rating || 5}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full h-2 bg-cream rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-small text-gray">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={rating === 0}
              className="flex-1"
            >
              Valider
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
