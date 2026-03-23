"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, Search, Loader2, Book, User, Hash } from "lucide-react";
import { Button } from "@/components/ui";

export interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GoogleBookResult {
  volumeId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string;
  genre: string;
}

type ModalStep = "search" | "preview" | "loading";

const loadingMessages = [
  "Vérification en base...",
  "Ajout en cours...",
  "Finalisation...",
];

export function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<ModalStep>("search");
  const [titleQuery, setTitleQuery] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");
  const [isbnQuery, setIsbnQuery] = useState("");
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<GoogleBookResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Check if we have a valid search
  const hasValidSearch = titleQuery.length >= 2 || authorQuery.length >= 2 || isbnQuery.length >= 2;
  const hasAnyInput = titleQuery.length > 0 || authorQuery.length > 0 || isbnQuery.length > 0;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("search");
      setTitleQuery("");
      setAuthorQuery("");
      setIsbnQuery("");
      setResults([]);
      setSelected(null);
      setError(null);
    } else {
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search function
  const performSearch = useCallback(async () => {
    if (!hasValidSearch) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (titleQuery.trim()) params.set("title", titleQuery.trim());
      if (authorQuery.trim()) params.set("author", authorQuery.trim());
      if (isbnQuery.trim()) params.set("isbn", isbnQuery.trim());

      const res = await fetch(`/api/books/search-google?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [titleQuery, authorQuery, isbnQuery, hasValidSearch]);

  // Debounced Google Books search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!hasValidSearch) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(performSearch, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [titleQuery, authorQuery, isbnQuery, hasValidSearch, performSearch]);

  const handleSelect = (book: GoogleBookResult) => {
    setSelected(book);
    setError(null);
    setStep("preview");
  };

  const handleBack = () => {
    setStep("search");
    setError(null);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setStep("loading");
    setLoadingMsg(loadingMessages[0]);

    const t1 = setTimeout(() => setLoadingMsg(loadingMessages[1]), 1000);
    const t2 = setTimeout(() => setLoadingMsg(loadingMessages[2]), 2200);

    try {
      const res = await fetch("/api/books/add-by-volume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volumeId: selected.volumeId }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setStep("preview");
        return;
      }

      onClose();
      router.push(`/livres/${data.book_id}`);
    } catch {
      clearTimeout(t1);
      clearTimeout(t2);
      setError("Erreur de connexion. Veuillez réessayer.");
      setStep("preview");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={step !== "loading" ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[520px] mx-5 overflow-hidden">
        {/* Header */}
        {step !== "loading" && (
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray/10">
            {step === "preview" && (
              <button
                type="button"
                onClick={handleBack}
                className="text-gray hover:text-dark transition-colors shrink-0"
                aria-label="Retour à la recherche"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-t3 font-semibold text-dark flex-1">
              {step === "search" ? "Ajouter un livre" : "Confirmer l'ajout"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray hover:text-dark transition-colors shrink-0"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step: Search */}
        {step === "search" && (
          <div className="flex flex-col p-6 gap-5">
            {/* Search Fields */}
            <div className="flex flex-col gap-3">
              {/* Title field */}
              <div className="relative">
                <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" />
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleQuery}
                  onChange={(e) => setTitleQuery(e.target.value)}
                  placeholder="Titre du livre"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray/30 rounded-lg text-body text-dark placeholder:text-gray/60 focus:border-dark focus:ring-1 focus:ring-dark outline-none transition-colors"
                />
              </div>

              {/* Author field */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" />
                <input
                  type="text"
                  value={authorQuery}
                  onChange={(e) => setAuthorQuery(e.target.value)}
                  placeholder="Auteur"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray/30 rounded-lg text-body text-dark placeholder:text-gray/60 focus:border-dark focus:ring-1 focus:ring-dark outline-none transition-colors"
                />
              </div>

              {/* ISBN field */}
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" />
                <input
                  type="text"
                  value={isbnQuery}
                  onChange={(e) => setIsbnQuery(e.target.value)}
                  placeholder="ISBN (optionnel)"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray/30 rounded-lg text-body text-dark placeholder:text-gray/60 focus:border-dark focus:ring-1 focus:ring-dark outline-none transition-colors"
                />
              </div>
            </div>

            {/* Helper text */}
            {!hasAnyInput && (
              <p className="text-small text-gray text-center">
                Remplissez au moins un champ pour rechercher
              </p>
            )}

            {/* Results */}
            <div className="flex flex-col min-h-[100px] max-h-[280px] overflow-y-auto">
              {isSearching && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-gray animate-spin" />
                </div>
              )}

              {!isSearching && hasValidSearch && results.length === 0 && (
                <p className="text-body text-gray text-center py-8">
                  Aucun résultat trouvé
                </p>
              )}

              {!isSearching && hasAnyInput && !hasValidSearch && (
                <p className="text-small text-gray text-center py-8">
                  Saisissez au moins 2 caractères dans un champ
                </p>
              )}

              {!isSearching &&
                results.map((book) => (
                  <button
                    key={book.volumeId}
                    onClick={() => handleSelect(book)}
                    className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-gray/5 transition-colors text-left w-full"
                  >
                    <div className="w-9 h-14 bg-cream rounded shrink-0 overflow-hidden">
                      {book.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-1">
                          <span className="text-[7px] text-gray font-display text-center leading-tight">
                            {book.title}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-body font-medium text-dark tracking-tight line-clamp-2 leading-snug">
                        {book.title}
                      </span>
                      <span className="text-small text-gray tracking-tight truncate">
                        {book.author}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && selected && (
          <div className="flex flex-col p-6 gap-5">
            <div className="flex gap-5">
              <div className="w-[72px] h-[108px] bg-cream rounded shrink-0 overflow-hidden">
                {selected.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.coverUrl}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <span className="text-[9px] text-gray font-display text-center leading-tight">
                      {selected.title}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <h3 className="text-t3 font-semibold text-dark tracking-tight leading-tight">
                  {selected.title}
                </h3>
                <span className="text-body text-gray">{selected.author}</span>
                {selected.genre && (
                  <span className="text-small text-gray/70 tracking-tight">
                    {selected.genre}
                  </span>
                )}
              </div>
            </div>

            {selected.description && (
              <p className="text-small text-gray leading-relaxed line-clamp-4">
                {selected.description}
              </p>
            )}

            {error && <p className="text-small text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2 border-t border-gray/10">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirm}
                className="flex-1"
              >
                Ajouter ce livre
              </Button>
            </div>
          </div>
        )}

        {/* Step: Loading */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center gap-5 py-16 px-6">
            <Loader2 className="w-10 h-10 text-dark animate-spin" />
            <p className="text-body font-medium text-dark">{loadingMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}
