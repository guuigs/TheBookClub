"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Loader2 } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { getUserListsWithBookStatus, addBookToList, removeBookFromList, createList, ensureDefaultReadingList } from "@/lib/db/lists";
import { useAuth } from "@/context/AuthContext";

export interface BookStatusButtonProps {
  bookId: string;
  initialStatus?: "to_read" | "read" | null;
  className?: string;
}

interface UserList {
  id: string;
  title: string;
  hasBook: boolean;
  isPinned: boolean;
}

export function BookStatusButton({
  bookId,
  className = "",
}: BookStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lists, setLists] = useState<UserList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { requireAuth, user } = useAuth();
  const toast = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowNewListInput(false);
        setNewListTitle("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch lists when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchLists();
    }
  }, [isOpen, user]);

  const fetchLists = async () => {
    setIsLoadingLists(true);
    // Ensure default "À lire" list exists
    await ensureDefaultReadingList();
    const { lists: userLists } = await getUserListsWithBookStatus(bookId);
    setLists(userLists);
    setIsLoadingLists(false);
  };

  const handleToggleDropdown = () => {
    requireAuth(() => setIsOpen(!isOpen));
  };

  const handleToggleBookInList = async (list: UserList) => {
    setIsLoading(true);
    if (list.hasBook) {
      const { error } = await removeBookFromList(list.id, bookId);
      if (error) {
        toast.error(error);
      } else {
        toast.info(`Retiré de "${list.title}"`);
        setLists(prev => prev.map(l => l.id === list.id ? { ...l, hasBook: false } : l));
      }
    } else {
      const { error } = await addBookToList(list.id, bookId);
      if (error) {
        toast.error(error);
      } else {
        toast.success(`Ajouté à "${list.title}"`);
        setLists(prev => prev.map(l => l.id === list.id ? { ...l, hasBook: true } : l));
      }
    }
    setIsLoading(false);
  };

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;
    setIsCreatingList(true);
    const { id, error } = await createList(newListTitle.trim());
    if (error) {
      toast.error(error);
    } else if (id) {
      // Add book to the new list
      await addBookToList(id, bookId);
      toast.success(`Liste "${newListTitle}" créée et livre ajouté`);
      setNewListTitle("");
      setShowNewListInput(false);
      fetchLists();
    }
    setIsCreatingList(false);
  };

  // Check if book is in any list
  const isInAnyList = lists.some(l => l.hasBook);
  const pinnedList = lists.find(l => l.isPinned);
  const isInPinnedList = pinnedList?.hasBook ?? false;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant={isInAnyList ? "secondary" : "primary"}
        onClick={handleToggleDropdown}
        disabled={isLoading}
        className={`w-full ${isInPinnedList ? "bg-amber-50 text-amber-600 border-current" : ""}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : isInPinnedList ? (
          <Check className="w-5 h-5 mr-2" />
        ) : null}
        {isInPinnedList ? "À lire" : "Ajouter à ma liste"}
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray/20 py-2 z-50">
          {isLoadingLists ? (
            <div className="px-4 py-3 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray" />
            </div>
          ) : (
            <>
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleToggleBookInList(list)}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray/10 transition-colors ${
                    list.hasBook ? "text-primary font-medium" : "text-dark"
                  } ${list.isPinned ? "border-l-2 border-primary" : ""}`}
                >
                  <span className="truncate">{list.title}</span>
                  {list.hasBook && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}

              <div className="h-px bg-gray/20 my-2" />

              {showNewListInput ? (
                <div className="px-4 py-2">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                    placeholder="Nom de la liste..."
                    className="w-full px-3 py-2 text-sm border border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                    maxLength={100}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="discrete"
                      size="xs"
                      onClick={() => {
                        setShowNewListInput(false);
                        setNewListTitle("");
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={handleCreateList}
                      disabled={!newListTitle.trim() || isCreatingList}
                      isLoading={isCreatingList}
                    >
                      Créer
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewListInput(true)}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray/10 transition-colors text-primary"
                >
                  <Plus className="w-4 h-4" />
                  Créer une liste
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
