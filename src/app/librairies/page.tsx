import { Header, Footer } from "@/components/layout";

export default function LibrairiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-5 py-[120px]">
        <div className="flex flex-col items-center text-center gap-8">
          <h1 className="font-display text-t1 text-dark tracking-tight">
            Librairies du club
          </h1>

          <div className="flex flex-col gap-6 max-w-[600px]">
            <p className="text-body text-gray leading-relaxed">
              Le Book Club est en train de construire un réseau de librairies indépendantes
              partenaires partout en France.
            </p>

            <p className="text-body text-gray leading-relaxed">
              Bientôt, vous pourrez acheter vos livres dans ces librairies et profiter
              d&apos;une réduction de 5% grâce à votre adhésion au club.
            </p>

            <div className="mt-8 p-8 bg-cream/50 rounded-xl">
              <p className="text-t4 font-semibold text-dark mb-2">
                Réseau en cours de création
              </p>
              <p className="text-body text-gray">
                Nous travaillons activement à établir des partenariats avec des librairies
                indépendantes. Revenez bientôt pour découvrir nos partenaires !
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
