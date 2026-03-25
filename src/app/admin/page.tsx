"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { Shield, Search, RefreshCw, CheckCircle, XCircle, Loader2, Trash2, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

const ADMIN_EMAIL = "guilhemtr@proton.me";

interface SearchDebugInfo {
  strategy: string;
  url: string;
  httpStatus?: number;
  totalItems?: number;
  itemsWithCovers: number;
  error?: string;
}

interface CoverResult {
  id: string;
  title: string;
  authorName?: string | null;
  status: string;
  coverUrl?: string;
  debugInfo?: SearchDebugInfo[];
}

interface FindCoversResponse {
  debugMode?: boolean;
  totalBooksWithoutCover?: number;
  processed?: number;
  total?: number;
  found: number;
  notFound: number;
  details: CoverResult[];
}

interface DuplicatePreview {
  title: string;
  author: string;
  count: number;
  ids: string[];
}

interface DuplicatesResponse {
  totalDuplicateGroups: number;
  totalDuplicateBooks: number;
  duplicates: DuplicatePreview[];
}

interface DeleteDuplicatesResponse {
  duplicateGroupsFound: number;
  totalDuplicates: number;
  deleted: number;
  errors: string[];
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FindCoversResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicatesPreview, setDuplicatesPreview] = useState<DuplicatesResponse | null>(null);
  const [duplicatesResult, setDuplicatesResult] = useState<DeleteDuplicatesResponse | null>(null);
  const [isLoadingDuplicates, setIsLoadingDuplicates] = useState(false);

  // Check authorization on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== ADMIN_EMAIL) {
        // Redirect to home without any indication this page exists
        router.replace("/");
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [router]);

  const handleFindCovers = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/admin/find-covers", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la recherche");
      }

      const data: FindCoversResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCovers = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/admin/update-covers", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      const data = await response.json();
      setResults({
        total: data.total,
        found: data.updated,
        notFound: data.skipped + data.failed,
        details: data.details,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewDuplicates = async () => {
    setIsLoadingDuplicates(true);
    setError(null);
    setDuplicatesPreview(null);
    setDuplicatesResult(null);

    try {
      const response = await fetch("/api/admin/delete-duplicates");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la recherche");
      }

      const data: DuplicatesResponse = await response.json();
      setDuplicatesPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoadingDuplicates(false);
    }
  };

  const handleDeleteDuplicates = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer tous les doublons ? Cette action est irréversible.")) {
      return;
    }

    setIsLoadingDuplicates(true);
    setError(null);
    setDuplicatesResult(null);

    try {
      const response = await fetch("/api/admin/delete-duplicates", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      const data: DeleteDuplicatesResponse = await response.json();
      setDuplicatesResult(data);
      setDuplicatesPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoadingDuplicates(false);
    }
  };

  // Show nothing while checking auth (prevents flash)
  if (isAuthorized === null) {
    return null;
  }

  // Should not reach here if not authorized (redirect happens), but just in case
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto py-10 desktop:py-[80px]">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-t2 font-semibold text-dark tracking-tight">
            Administration
          </h1>
        </div>

        <div className="grid gap-6">
          {/* Find Covers Section */}
          <section className="p-6 bg-gray/5 rounded-xl border border-gray/10">
            <h2 className="text-t4 font-semibold text-dark mb-2">
              Rechercher des covers manquantes
            </h2>
            <p className="text-body text-gray mb-4">
              Recherche sur Google Books les covers pour les livres qui n&apos;en ont pas.
              Priorité aux résultats en français.
            </p>
            <Button
              variant="primary"
              onClick={handleFindCovers}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Search className="w-5 h-5 mr-2" />
              )}
              Rechercher les covers
            </Button>
          </section>

          {/* Update Covers Section */}
          <section className="p-6 bg-gray/5 rounded-xl border border-gray/10">
            <h2 className="text-t4 font-semibold text-dark mb-2">
              Mettre à jour les covers existantes
            </h2>
            <p className="text-body text-gray mb-4">
              Vérifie et met à jour les covers existantes vers une meilleure qualité
              si disponible sur Google Books.
            </p>
            <Button
              variant="secondary"
              onClick={handleUpdateCovers}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              Mettre à jour les covers
            </Button>
          </section>

          {/* Delete Duplicates Section */}
          <section className="p-6 bg-red-50/50 rounded-xl border border-red-200/50">
            <h2 className="text-t4 font-semibold text-dark mb-2">
              Supprimer les doublons
            </h2>
            <p className="text-body text-gray mb-4">
              Recherche et supprime les livres en double (même titre + même auteur).
              Les notes et commentaires sont conservés sur le livre restant.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handlePreviewDuplicates}
                disabled={isLoadingDuplicates}
              >
                {isLoadingDuplicates ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-5 h-5 mr-2" />
                )}
                Prévisualiser
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteDuplicates}
                disabled={isLoadingDuplicates || !duplicatesPreview}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoadingDuplicates ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5 mr-2" />
                )}
                Supprimer les doublons
              </Button>
            </div>

            {/* Duplicates Preview */}
            {duplicatesPreview && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray/10">
                <p className="text-body font-medium text-dark mb-3">
                  {duplicatesPreview.totalDuplicateGroups} groupe(s) de doublons trouvé(s)
                  ({duplicatesPreview.totalDuplicateBooks} livre(s) à supprimer)
                </p>
                <div className="max-h-[200px] overflow-y-auto">
                  <ul className="space-y-1">
                    {duplicatesPreview.duplicates.map((dup, i) => (
                      <li key={i} className="text-small text-gray">
                        <span className="font-medium text-dark">{dup.title}</span>
                        {" "}par {dup.author} — {dup.count} exemplaires
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Duplicates Result */}
            {duplicatesResult && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-body font-medium text-green-700">
                  {duplicatesResult.deleted} doublon(s) supprimé(s) avec succès
                </p>
                {duplicatesResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-small font-medium text-red-600">Erreurs :</p>
                    <ul className="text-small text-red-600">
                      {duplicatesResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-body font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <section className="p-6 bg-gray/5 rounded-xl border border-gray/10">
              <h2 className="text-t4 font-semibold text-dark mb-4">
                Résultats
                {results.debugMode && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                    MODE DEBUG (5 premiers livres)
                  </span>
                )}
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white rounded-lg border border-gray/10 text-center">
                  <p className="text-t3 font-semibold text-dark">
                    {results.processed ?? results.total}
                  </p>
                  <p className="text-small text-gray">
                    Analysés {results.totalBooksWithoutCover && `/ ${results.totalBooksWithoutCover} total`}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-t3 font-semibold text-green-700">{results.found}</p>
                  <p className="text-small text-green-600">Covers trouvées</p>
                </div>
                <div className="p-4 bg-gray/5 rounded-lg border border-gray/10 text-center">
                  <p className="text-t3 font-semibold text-gray">{results.notFound}</p>
                  <p className="text-small text-gray">Non trouvées</p>
                </div>
              </div>

              {/* Detailed Results with Debug Info */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {results.details.map((item) => (
                  <div key={item.id} className="p-4 bg-white rounded-lg border border-gray/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-dark">{item.title}</p>
                        <p className="text-small text-gray">
                          Auteur: {item.authorName ?? "Non trouvé"}
                        </p>
                      </div>
                      {item.status === "cover_found" ? (
                        <span className="flex items-center gap-1 text-small text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Cover trouvée
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-small text-red-500">
                          <XCircle className="w-4 h-4" />
                          Pas de cover
                        </span>
                      )}
                    </div>

                    {item.coverUrl && (
                      <div className="mb-2">
                        <a
                          href={item.coverUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-small text-primary underline break-all"
                        >
                          {item.coverUrl.substring(0, 80)}...
                        </a>
                      </div>
                    )}

                    {/* Debug Info */}
                    {item.debugInfo && item.debugInfo.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-small text-gray cursor-pointer hover:text-dark">
                          Debug: {item.debugInfo.length} requêtes effectuées
                        </summary>
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray/20">
                          {item.debugInfo.map((debug, idx) => (
                            <div key={idx} className="text-xs font-mono bg-gray/5 p-2 rounded">
                              <p className="font-semibold">{debug.strategy}</p>
                              <p className="text-gray break-all">{debug.url}</p>
                              <p>
                                Status: {debug.httpStatus ?? "N/A"} |
                                Items: {debug.totalItems ?? 0} |
                                Avec cover: {debug.itemsWithCovers}
                                {debug.error && (
                                  <span className="text-red-500"> | Erreur: {debug.error}</span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
