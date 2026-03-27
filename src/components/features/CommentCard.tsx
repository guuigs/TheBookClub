"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Pencil, Trash2, Check, CornerDownRight } from "lucide-react";
import { Avatar, RatingStars, Badge, Button } from "@/components/ui";
import { toggleCommentLike, updateComment, deleteComment, createComment } from "@/lib/db/comments";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils/format";
import type { Comment } from "@/types";

export interface CommentCardProps {
  comment: Comment;
  showBookInfo?: boolean;
  truncate?: boolean;
  maxLines?: number;
  className?: string;
  onDeleted?: () => void;
  onUpdated?: (newContent: string) => void;
  onReplyAdded?: (reply: Comment) => void;
  isReply?: boolean;
}

export function CommentCard({
  comment,
  showBookInfo = false,
  truncate = true,
  maxLines = 3,
  className = "",
  onDeleted,
  onUpdated,
  onReplyAdded,
  isReply = false,
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

  // Reply state
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [localReplies, setLocalReplies] = useState<Comment[]>(comment.replies ?? []);

  const formattedDate = formatDate(comment.createdAt);

  const handleSubmitReply = async () => {
    if (!replyText.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);
    const { data: newReply, error } = await createComment(comment.bookId, replyText.trim(), false, comment.id);
    if (!error && newReply) {
      setLocalReplies(prev => [...prev, newReply]);
      onReplyAdded?.(newReply);
      setReplyText("");
      setShowReplyForm(false);
    }
    setIsSubmittingReply(false);
  };

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
      <Link href={`/account/${comment.user.id}`} className="shrink-0">
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
              href={`/account/${comment.user.id}`}
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

          {!isReply && user && (
            <button
              type="button"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-gray hover:text-dark transition-colors"
              aria-label="Répondre à ce commentaire"
            >
              <CornerDownRight className="w-4 h-4" />
              <span className="text-sm font-medium">Répondre</span>
            </button>
          )}

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
        {/* Reply form */}
        {showReplyForm && (
          <div className="flex flex-col gap-2 pl-2 border-l-2 border-gray/20">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value.slice(0, 500))}
              placeholder="Votre réponse..."
              rows={2}
              className="w-full px-3 py-2 border border-gray/30 rounded-lg text-body text-dark resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              maxLength={500}
            />
            <div className="flex gap-2">
              <Button variant="primary" size="xs" onClick={handleSubmitReply} disabled={!replyText.trim()} isLoading={isSubmittingReply}>
                Publier
              </Button>
              <Button variant="discrete" size="xs" onClick={() => { setShowReplyForm(false); setReplyText(""); }}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Replies — one level deep only */}
      {!isReply && localReplies.length > 0 && (
        <div className="flex flex-col gap-4 pl-10 border-l-2 border-gray/10 ml-10">
          {localReplies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              truncate={false}
              isReply
              onDeleted={() => setLocalReplies(prev => prev.filter(r => r.id !== reply.id))}
            />
          ))}
        </div>
      )}
    </article>
  );
}
