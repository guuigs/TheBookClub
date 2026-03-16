"use client";

import { useState } from "react";
import { Button, useToast } from "@/components/ui";
import { followUser, unfollowUser } from "@/lib/db/follows";

export interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean, newCount: number) => void;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleToggle = async () => {
    setIsLoading(true);

    if (isFollowing) {
      const { error } = await unfollowUser(targetUserId);
      if (!error) {
        setIsFollowing(false);
        onFollowChange?.(false, -1);
        toast.info("Desabonne");
      } else {
        toast.error("Erreur lors du desabonnement");
      }
    } else {
      const { error } = await followUser(targetUserId);
      if (!error) {
        setIsFollowing(true);
        onFollowChange?.(true, 1);
        toast.success("Abonne !");
      } else {
        toast.error("Erreur lors de l'abonnement");
      }
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "primary"}
      onClick={handleToggle}
      disabled={isLoading}
      className="w-fit"
    >
      {isLoading
        ? "..."
        : isFollowing
        ? "Abonné"
        : "S'abonner"}
    </Button>
  );
}
