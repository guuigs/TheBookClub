"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { toggleListLike, deleteList } from "@/lib/db/lists";
import { useAuth } from "@/context/AuthContext";

export interface ListActionsProps {
  listId: string;
  isOwner: boolean;
  initialLiked: boolean;
  initialLikesCount: number;
}

export function ListActions({
  listId,
  isOwner,
  initialLiked,
  initialLikesCount,
}: ListActionsProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const performLike = async () => {
    setIsLiking(true);
    const { liked, error } = await toggleListLike(listId);
    if (!error) {
      setIsLiked(liked);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
    setIsLiking(false);
  };

  const handleLike = () => {
    requireAuth(performLike);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await deleteList(listId);
    if (!error) {
      router.push("/listes");
    } else {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/listes/${listId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {!isOwner && (
          <Button
            variant={isLiked ? "primary" : "secondary"}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`w-5 h-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Aimé" : "J'aime"} ({likesCount})
          </Button>
        )}
        <Button variant="secondary" onClick={handleShare}>
          <Share2 className="w-5 h-5 mr-2" />
          Partager
        </Button>
        {isOwner && (
          <>
            <Link href={`/listes/${listId}/edit`}>
              <Button variant="secondary">
                <Edit className="w-5 h-5 mr-2" />
                Modifier
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl p-8 w-full max-w-[400px] flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-t3 text-dark tracking-tight">
              Supprimer cette liste ?
            </h2>
            <p className="text-body text-gray">
              Cette action est irréversible. Tous les livres seront retirés de
              la liste.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
          onClick={() => setShowShareModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl p-8 w-full max-w-[400px] flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-t3 text-dark tracking-tight">
              Partager cette liste
            </h2>
            <div className="flex items-center gap-3 p-3 bg-gray/10 rounded-lg">
              <span className="text-sm font-medium text-dark flex-1 truncate">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/listes/${listId}`
                  : `/listes/${listId}`}
              </span>
              <Button variant="primary" size="xs" onClick={handleCopyLink}>
                {copied ? "Copié !" : "Copier le lien"}
              </Button>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowShareModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
