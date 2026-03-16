"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Pencil, Trash2, X, Check } from "lucide-react";
import { Avatar, RatingStars, Badge, Button } from "@/components/ui";
import { toggleCommentLike, updateComment, deleteComment } from "@/lib/db/comments";
import { useAuth } from "@/context/AuthContext";
import type { Comment } from "@/types";

export interface CommentCardProps {
  comment: Comment;
  showBookInfo?: boolean;
  truncate?: boolean;
  maxLines?: number;
  className?: string;
  onDeleted?: () => void;
  onUpdated?: (newContent: string) => void;
}

export function CommentCard({
  comment,
  showBookInfo = false,
  truncate = true,
  maxLines = 3,
  className = "",
  onDeleted,
  onUpdated,
}: CommentCardProps) {
  const { user } = useAuth();
  const isOwner = user?.id === comment.user.id;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLikedByCurrentUser ?? false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isLiking, setIsLiking] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(comment.content);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(comment.createdAt);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    const { liked, error } = await toggleCommentLike(comment.id);
    if (error) {
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    } else {
      setIsLiked(liked);
    }

    setIsLiking(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim() || isSaving) return;
    setIsSaving(true);

    const { error } = await updateComment(comment.id, editContent.trim());
    if (!error) {
      setContent(editContent.trim());
      setIsEditing(false);
      onUpdated?.(editContent.trim());
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    const { error } = await deleteComment(comment.id);
    if (!error) {
      onDeleted?.();
    }

    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  // Calculate if text needs truncation (300 chars)
  const shouldTruncate = truncate && content.length > 300;

  return (
    <article className={`flex gap-4 w-full ${className}`}>
      {/* Avatar */}
      <Link href={`/members/${comment.user.id}`} className="shrink-0">
        <Avatar
          src={comment.user.avatarUrl}
          alt={comment.user.username}
          size="sm"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Header: Username, Badge, Rating, Date */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center">
            <Link
              href={`/members/${comment.user.id}`}
              className="text-body font-medium text-dark tracking-tight hover:text-primary transition-colors"
            >
              {comment.user.username}
            </Link>
            <Badge type={comment.user.badge} size="sm" className="ml-1" />
          </div>

          {comment.rating && (
            <RatingStars rating={comment.rating} size="sm" />
          )}

          <span className="text-small text-gray tracking-tight">
            noté le {formattedDate}
          </span>
        </div>

        {/* Comment Text */}
        <div>
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value.slice(0, 2000))}
                className="w-full px-3 py-2 border border-gray/30 rounded-lg text-body text-dark resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                maxLength={2000}
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={handleEdit}
                  disabled={!editContent.trim()}
                  isLoading={isSaving}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Enregistrer
                </Button>
                <Button
                  variant="discrete"
                  size="xs"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(content);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p
                className={`text-body font-medium text-dark tracking-tight leading-relaxed ${
                  shouldTruncate && !isExpanded ? `line-clamp-${maxLines}` : ""
                }`}
                style={
                  shouldTruncate && !isExpanded
                    ? {
                        display: "-webkit-box",
                        WebkitLineClamp: maxLines,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }
                    : undefined
                }
              >
                {content}
              </p>

              {shouldTruncate && (
                <Button
                  variant="discrete"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2"
                >
                  {isExpanded ? "voir moins" : "voir plus"}
                </Button>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            aria-label={isLiked ? "Ne plus aimer ce commentaire" : "Aimer ce commentaire"}
            aria-pressed={isLiked}
            className="flex items-center gap-1 group w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLiked
                  ? "fill-primary text-primary"
                  : "text-dark group-hover:text-primary"
              }`}
              aria-hidden="true"
            />
            <span className="text-body font-medium text-dark tracking-tight group-hover:text-primary transition-colors" aria-live="polite" aria-atomic="true">
              {likesCount} like{likesCount > 1 ? "s" : ""}
            </span>
          </button>

          {isOwner && !isEditing && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-gray hover:text-dark transition-colors"
                aria-label="Modifier le commentaire"
              >
                <Pencil className="w-4 h-4" />
                <span className="text-sm font-medium">Modifier</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 text-gray hover:text-red-600 transition-colors"
                aria-label="Supprimer le commentaire"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Supprimer</span>
              </button>
            </>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <span className="text-sm text-red-700">Supprimer ce commentaire ?</span>
            <Button
              variant="danger"
              size="xs"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Oui
            </Button>
            <Button
              variant="discrete"
              size="xs"
              onClick={() => setShowDeleteConfirm(false)}
              className="text-red-700"
            >
              Non
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
