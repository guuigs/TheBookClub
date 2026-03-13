import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { Heart, Coffee, CreditCard } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-6">
          Me soutenir
        </h1>
        <p className="text-body text-gray mb-[60px] leading-relaxed">
          Le Book Club est un projet porté par une seule personne. Les serveurs,
          la maintenance, l&apos;entretien et l&apos;administration me prennent beaucoup
          de temps et d&apos;argent. N&apos;hésitez pas à me soutenir si vous le souhaitez
          et si vous le pouvez. Je vous remercie d&apos;avance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-[60px]">
          {/* One-time donation */}
          <div className="flex flex-col items-center gap-5 p-8 border border-cream rounded-lg hover:border-primary transition-colors">
            <Coffee className="w-12 h-12 text-primary" />
            <h3 className="text-t4 font-semibold text-dark text-center">
              Un café
            </h3>
            <p className="text-body text-gray text-center">
              Un petit geste pour me motiver
            </p>
            <p className="text-t3 font-semibold text-primary">5€</p>
            <Button variant="primary" className="w-full">
              Offrir un café
            </Button>
          </div>

          {/* Monthly support */}
          <div className="flex flex-col items-center gap-5 p-8 border-2 border-primary rounded-lg relative">
            <div className="absolute -top-3 bg-primary text-white px-3 py-1 rounded-full text-small font-medium">
              Populaire
            </div>
            <Heart className="w-12 h-12 text-primary" />
            <h3 className="text-t4 font-semibold text-dark text-center">
              Soutien mensuel
            </h3>
            <p className="text-body text-gray text-center">
              Soutenez le club chaque mois
            </p>
            <p className="text-t3 font-semibold text-primary">10€/mois</p>
            <Button variant="primary" className="w-full">
              Devenir bienfaiteur
            </Button>
          </div>

          {/* Custom amount */}
          <div className="flex flex-col items-center gap-5 p-8 border border-cream rounded-lg hover:border-primary transition-colors">
            <CreditCard className="w-12 h-12 text-primary" />
            <h3 className="text-t4 font-semibold text-dark text-center">
              Montant libre
            </h3>
            <p className="text-body text-gray text-center">
              Choisissez votre contribution
            </p>
            <p className="text-t3 font-semibold text-primary">???€</p>
            <Button variant="secondary" className="w-full">
              Faire un don
            </Button>
          </div>
        </div>

        <div className="bg-cream/50 rounded-lg p-8">
          <h2 className="text-t4 font-semibold text-dark mb-4">
            Avantages des bienfaiteurs
          </h2>
          <ul className="flex flex-col gap-3 text-body text-dark">
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span>
              Badge bienfaiteur sur votre profil
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span>
              Accès anticipé aux nouvelles fonctionnalités
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span>
              Nom dans la page des remerciements
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">✓</span>
              Support prioritaire
            </li>
          </ul>
        </div>

        <div className="mt-10 text-center">
          <p className="text-body text-gray">
            Des questions ?{" "}
            <Link href="/contact" className="text-primary underline hover:opacity-80">
              Contactez-nous
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
