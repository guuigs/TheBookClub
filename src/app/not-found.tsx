import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { Home, Search, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="flex flex-col items-center text-center max-w-[500px]">
          <div className="flex flex-col items-center gap-2 mb-8">
            <span className="font-display text-[120px] text-primary leading-none">404</span>
          </div>

          <h1 className="font-display text-t1 text-dark tracking-tight mb-4">
            Page introuvable
          </h1>

          <p className="text-body text-gray mb-10 leading-relaxed">
            Oups ! Cette page semble avoir disparu de notre bibliotheque.
            Peut-etre qu&apos;elle a ete empruntee et jamais rendue...
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/">
              <Button variant="primary" size="md">
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            </Link>
            <Link href="/books">
              <Button variant="secondary" size="md">
                <BookOpen className="w-4 h-4 mr-2" />
                Parcourir les livres
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="secondary" size="md">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
