"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button, RatingStars } from "@/components/ui";
import type { Book } from "@/types";

export interface CommentModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; content: string }) => void;
  initialRating?: number;
  initialContent?: string;
}

export function CommentModal({
  book,
  isOpen,
  onClose,
  onSubmit,
  initialRating = 0,
  initialContent = "",
}: CommentModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && content.trim()) {
      onSubmit({ rating, content: content.trim() });
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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[500px] mx-5 p-6 max-h-[90vh] overflow-y-auto">
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
          <div className="flex flex-col gap-2">
            <h2 className="text-t3 font-semibold text-dark">
              Écrire une critique
            </h2>
            <p className="text-body text-gray font-display">
              {book.title}
            </p>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-3">
            <label className="text-body font-medium text-dark">
              Votre note
            </label>
            <div className="flex items-center gap-4">
              <RatingStars
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
              <span className="text-t4 font-semibold text-primary">
                {rating > 0 ? `${rating}/10` : "-"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="comment-content"
              className="text-body font-medium text-dark"
            >
              Votre critique
            </label>
            <textarea
              id="comment-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Partagez votre avis sur ce livre..."
              rows={6}
              className="w-full px-4 py-3 bg-white border border-gray rounded-lg text-dark placeholder:text-gray focus:border-primary focus:ring-1 focus:ring-primary font-medium text-body tracking-tight resize-none"
              required
            />
            <p className="text-small text-gray text-right">
              {content.length} caractères
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray/20">
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
              disabled={rating === 0 || !content.trim()}
              className="flex-1"
            >
              Publier
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
