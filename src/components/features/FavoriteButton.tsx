"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { toggleFavorite } from "@/lib/db/favorites";
import { useAuth } from "@/context/AuthContext";

export interface FavoriteButtonProps {
  bookId: string;
  initialIsFavorite: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  bookId,
  initialIsFavorite,
  onToggle,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { requireAuth } = useAuth();

  const performToggle = async () => {
    setIsLoading(true);

    const result = await toggleFavorite(bookId);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsFavorite(result.isFavorite);
      onToggle?.(result.isFavorite);
      if (result.isFavorite) {
        toast.success("Ajoute aux coups de coeur !");
      } else {
        toast.info("Retire des coups de coeur");
      }
    }

    setIsLoading(false);
  };

  const handleToggle = () => {
    requireAuth(performToggle);
  };

  return (
    <Button
      variant={isFavorite ? "primary" : "secondary"}
      size="md"
      onClick={handleToggle}
      isLoading={isLoading}
      className={isFavorite ? "bg-primary hover:bg-primary/90" : ""}
    >
      <Heart
        className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`}
      />
      {isFavorite ? "Coup de coeur" : "Ajouter aux coups de coeur"}
    </Button>
  );
}
