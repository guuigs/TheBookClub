"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, BookMarked, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui";
import { setBookStatus, removeBookStatus, type BookStatus } from "@/lib/db/books";

export interface BookStatusButtonProps {
  bookId: string;
  initialStatus: BookStatus;
}

const statusConfig = {
  to_read: {
    label: "À lire",
    icon: BookMarked,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  read: {
    label: "Lu",
    icon: BookOpen,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
} as const;

export function BookStatusButton({
  bookId,
  initialStatus,
}: BookStatusButtonProps) {
  const [status, setStatus] = useState<BookStatus>(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSetStatus = async (newStatus: "to_read" | "read") => {
    setIsLoading(true);
    const { error } = await setBookStatus(bookId, newStatus);
    if (!error) {
      setStatus(newStatus);
    }
    setIsLoading(false);
    setIsOpen(false);
  };

  const handleRemoveStatus = async () => {
    setIsLoading(true);
    const { error } = await removeBookStatus(bookId);
    if (!error) {
      setStatus(null);
    }
    setIsLoading(false);
    setIsOpen(false);
  };

  const currentConfig = status ? statusConfig[status] : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant={status ? "secondary" : "primary"}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={status && currentConfig ? `${currentConfig.bgColor} ${currentConfig.color} border-current` : ""}
      >
        {isLoading ? (
          "..."
        ) : status && currentConfig ? (
          <>
            <currentConfig.icon className="w-5 h-5 mr-2" />
            {currentConfig.label}
            <ChevronDown className="w-4 h-4 ml-2" />
          </>
        ) : (
          <>
            Ajouter à ma liste
            <ChevronDown className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray/20 py-2 z-50">
          <button
            onClick={() => handleSetStatus("to_read")}
            className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray/10 transition-colors ${
              status === "to_read" ? "bg-amber-50 text-amber-600" : "text-dark"
            }`}
          >
            <BookMarked className="w-5 h-5" />
            À lire
          </button>
          <button
            onClick={() => handleSetStatus("read")}
            className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray/10 transition-colors ${
              status === "read" ? "bg-green-50 text-green-600" : "text-dark"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Lu
          </button>
          {status && (
            <>
              <div className="h-px bg-gray/20 my-2" />
              <button
                onClick={handleRemoveStatus}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
                Retirer de ma liste
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
