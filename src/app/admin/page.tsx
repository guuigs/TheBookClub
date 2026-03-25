"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { Shield, Search, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

const ADMIN_EMAIL = "guilhemtr@proton.me";

interface CoverResult {
  id: string;
  title: string;
  status: string;
  coverUrl?: string;
}

interface FindCoversResponse {
  total: number;
  found: number;
  notFound: number;
  details: CoverResult[];
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FindCoversResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white rounded-lg border border-gray/10 text-center">
                  <p className="text-t3 font-semibold text-dark">{results.total}</p>
                  <p className="text-small text-gray">Total analysé</p>
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

              {/* Detailed Results */}
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-gray/5">
                    <tr>
                      <th className="p-2 text-small font-semibold text-dark">Titre</th>
                      <th className="p-2 text-small font-semibold text-dark">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.details.map((item) => (
                      <tr key={item.id} className="border-t border-gray/10">
                        <td className="p-2 text-small text-dark">{item.title}</td>
                        <td className="p-2">
                          {item.status === "cover_found" || item.status === "upgraded" || item.status === "set_to_generated" ? (
                            <span className="flex items-center gap-1 text-small text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              {item.status === "cover_found" ? "Cover trouvée" :
                               item.status === "upgraded" ? "Améliorée" : "Cover générée"}
                            </span>
                          ) : item.status === "no_cover_found" || item.status === "no_cover" ? (
                            <span className="flex items-center gap-1 text-small text-gray">
                              <XCircle className="w-4 h-4" />
                              Pas de cover
                            </span>
                          ) : (
                            <span className="text-small text-gray">{item.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
