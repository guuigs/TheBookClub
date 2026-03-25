"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { Loader2 } from "lucide-react";
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

type ActiveTask = "none" | "findCovers" | "updateCovers" | "previewDuplicates" | "deleteDuplicates";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTask, setActiveTask] = useState<ActiveTask>("none");
  const [coversResult, setCoversResult] = useState<FindCoversResponse | null>(null);
  const [duplicatesPreview, setDuplicatesPreview] = useState<DuplicatesResponse | null>(null);
  const [duplicatesResult, setDuplicatesResult] = useState<DeleteDuplicatesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace("/");
        return;
      }
      setIsAuthorized(true);
    };
    checkAuth();
  }, [router]);

  const resetState = () => {
    setError(null);
    setCoversResult(null);
    setDuplicatesPreview(null);
    setDuplicatesResult(null);
  };

  const handleFindCovers = async () => {
    resetState();
    setActiveTask("findCovers");
    try {
      const res = await fetch("/api/admin/find-covers", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setCoversResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActiveTask("none");
    }
  };

  const handleUpdateCovers = async () => {
    resetState();
    setActiveTask("updateCovers");
    try {
      const res = await fetch("/api/admin/update-covers", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setCoversResult({
        found: data.updated,
        notFound: data.skipped + data.failed,
        processed: data.total,
        details: data.details,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActiveTask("none");
    }
  };

  const handlePreviewDuplicates = async () => {
    resetState();
    setActiveTask("previewDuplicates");
    try {
      const res = await fetch("/api/admin/delete-duplicates");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setDuplicatesPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActiveTask("none");
    }
  };

  const handleDeleteDuplicates = async () => {
    if (!confirm("Supprimer tous les doublons ? Cette action est irréversible.")) return;
    setActiveTask("deleteDuplicates");
    setError(null);
    try {
      const res = await fetch("/api/admin/delete-duplicates", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setDuplicatesResult(data);
      setDuplicatesPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setActiveTask("none");
    }
  };

  if (isAuthorized === null || !isAuthorized) return null;

  const isLoading = activeTask !== "none";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto py-10 desktop:py-[80px]">
        <h1 className="text-t2 font-semibold text-dark tracking-tight mb-8">
          Administration
        </h1>

        {/* Actions */}
        <div className="grid tablet:grid-cols-2 gap-4 mb-8">
          {/* Covers Actions */}
          <div className="p-6 bg-gray/5 rounded-xl">
            <h2 className="text-t4 font-semibold text-dark mb-2">Covers</h2>
            <p className="text-small text-gray mb-4">
              Rechercher des covers haute qualité sur Google Books.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleFindCovers}
                disabled={isLoading}
              >
                {activeTask === "findCovers" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Chercher covers manquantes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUpdateCovers}
                disabled={isLoading}
              >
                {activeTask === "updateCovers" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Améliorer existantes
              </Button>
            </div>
          </div>

          {/* Duplicates Actions */}
          <div className="p-6 bg-gray/5 rounded-xl">
            <h2 className="text-t4 font-semibold text-dark mb-2">Doublons</h2>
            <p className="text-small text-gray mb-4">
              Détecter et supprimer les livres en double.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePreviewDuplicates}
                disabled={isLoading}
              >
                {activeTask === "previewDuplicates" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Analyser
              </Button>
              {duplicatesPreview && duplicatesPreview.totalDuplicateBooks > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDeleteDuplicates}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {activeTask === "deleteDuplicates" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Supprimer ({duplicatesPreview.totalDuplicateBooks})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-body text-red-700">{error}</p>
          </div>
        )}

        {/* Covers Results */}
        {coversResult && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-t4 font-semibold text-dark">Résultats</h2>
              {coversResult.debugMode && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  Mode test
                </span>
              )}
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 p-4 bg-gray/5 rounded-lg text-center">
                <p className="text-t3 font-semibold text-dark">{coversResult.processed ?? coversResult.details.length}</p>
                <p className="text-small text-gray">Analysés</p>
              </div>
              <div className="flex-1 p-4 bg-green-50 rounded-lg text-center">
                <p className="text-t3 font-semibold text-green-700">{coversResult.found}</p>
                <p className="text-small text-green-600">Trouvées</p>
              </div>
              <div className="flex-1 p-4 bg-gray/5 rounded-lg text-center">
                <p className="text-t3 font-semibold text-gray">{coversResult.notFound}</p>
                <p className="text-small text-gray">Non trouvées</p>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {coversResult.details.slice(0, 50).map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    item.status === "cover_found" || item.status === "upgraded"
                      ? "bg-green-50"
                      : "bg-gray/5"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-dark truncate">{item.title}</p>
                    {item.authorName && (
                      <p className="text-small text-gray">{item.authorName}</p>
                    )}
                  </div>
                  <span className={`text-small font-medium ml-4 ${
                    item.status === "cover_found" || item.status === "upgraded"
                      ? "text-green-600"
                      : "text-gray"
                  }`}>
                    {item.status === "cover_found" ? "Trouvée" :
                     item.status === "upgraded" ? "Améliorée" :
                     item.status === "no_cover_found" ? "Aucune" :
                     item.status}
                  </span>
                </div>
              ))}
              {coversResult.details.length > 50 && (
                <p className="text-small text-gray text-center py-2">
                  ... et {coversResult.details.length - 50} autres
                </p>
              )}
            </div>
          </div>
        )}

        {/* Duplicates Preview */}
        {duplicatesPreview && (
          <div className="mb-8">
            <h2 className="text-t4 font-semibold text-dark mb-4">
              {duplicatesPreview.totalDuplicateGroups} groupe(s) de doublons
              <span className="text-gray font-normal ml-2">
                ({duplicatesPreview.totalDuplicateBooks} à supprimer)
              </span>
            </h2>

            {duplicatesPreview.duplicates.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {duplicatesPreview.duplicates.map((dup, i) => (
                  <div key={i} className="p-3 bg-gray/5 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-body font-medium text-dark">{dup.title}</p>
                      <p className="text-small text-gray">{dup.author}</p>
                    </div>
                    <span className="text-small font-medium text-primary">
                      {dup.count} exemplaires
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body text-gray">Aucun doublon trouvé.</p>
            )}
          </div>
        )}

        {/* Duplicates Result */}
        {duplicatesResult && (
          <div className={`p-4 rounded-lg ${
            duplicatesResult.deleted > 0 ? "bg-green-50" : "bg-gray/5"
          }`}>
            <p className="text-body font-medium text-dark">
              {duplicatesResult.deleted} doublon(s) supprimé(s)
            </p>
            {duplicatesResult.errors.length > 0 && (
              <div className="mt-2 text-small text-red-600">
                {duplicatesResult.errors.slice(0, 5).map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
