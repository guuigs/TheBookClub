"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="text-center max-w-md">
          <h1 className="font-display text-t1 text-dark tracking-tight mb-4">
            Oups ! Une erreur est survenue
          </h1>

          <p className="text-body text-gray mb-8">
            Desolee, quelque chose s&apos;est mal passe. Vous pouvez reessayer ou
            retourner a l&apos;accueil.
          </p>

          {error.digest && (
            <p className="text-small text-gray/60 mb-6">
              Code erreur : {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={() => reset()}
            >
              Reessayer
            </Button>

            <Link href="/">
              <Button variant="secondary">
                Retour a l&apos;accueil
              </Button>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray/10">
            <p className="text-small text-gray mb-4">
              Le probleme persiste ?
            </p>
            <Link
              href="/contact"
              className="text-primary underline hover:opacity-80 text-body"
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
