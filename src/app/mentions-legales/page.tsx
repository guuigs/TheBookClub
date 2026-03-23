import { Header, Footer } from "@/components/layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales | The Book Club",
  description: "Mentions légales du site The Book Club",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 py-10">
        <div className="w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto">
          <h1 className="font-display text-t1 text-dark tracking-tight mb-8">
            Mentions Légales
          </h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">1. Editeur du site</h2>
              <p className="text-body text-gray mb-4">
                Le site The Book Club est edite par :
              </p>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li><strong>Nom :</strong> Guilhem Terrier</li>
                <li><strong>Adresse :</strong> 2 rue tartenmpion (me contacter via mail)</li>
                <li><strong>Email :</strong> guilhemtr@proton.me</li>
                <li><strong>Directeur de la publication :</strong> Guilhem Terrier</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">2. Hebergement</h2>
              <p className="text-body text-gray mb-4">
                Le site est heberge par :
              </p>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li><strong>Hebergeur :</strong> Vercel Inc.</li>
                <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
                <li><strong>Site web :</strong> https://vercel.com</li>
              </ul>
              <p className="text-body text-gray mt-4">
                Les donnees sont stockees par :
              </p>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li><strong>Service :</strong> Supabase Inc.</li>
                <li><strong>Site web :</strong> https://supabase.com</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">3. Propriete intellectuelle</h2>
              <p className="text-body text-gray mb-4">
                L&apos;ensemble du contenu de ce site (textes, images, videos, logos, icones,
                sons, logiciels, etc.) est protege par le droit d&apos;auteur et le droit des
                marques.
              </p>
              <p className="text-body text-gray mb-4">
                Les couvertures de livres et informations bibliographiques sont la propriete
                de leurs editeurs respectifs et sont utilisees a des fins d&apos;information
                uniquement. Les donnees sont issues de l&apos;API Google Books.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">4. Donnees personnelles</h2>
              <p className="text-body text-gray mb-4">
                Conformement au Reglement General sur la Protection des Donnees (RGPD) et
                a la loi Informatique et Libertes, vous disposez de droits sur vos donnees
                personnelles.
              </p>
              <p className="text-body text-gray">
                Pour plus d&apos;informations, consultez notre{" "}
                <a href="/privacy" className="text-primary underline hover:opacity-80">
                  politique de confidentialite
                </a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">5. Cookies</h2>
              <p className="text-body text-gray">
                Ce site utilise des cookies essentiels au fonctionnement du service.
                Pour en savoir plus, consultez notre{" "}
                <a href="/cookies" className="text-primary underline hover:opacity-80">
                  politique relative aux cookies
                </a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">6. Limitation de responsabilite</h2>
              <p className="text-body text-gray mb-4">
                L&apos;editeur s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusees
                sur ce site, mais ne peut garantir leur exhaustivite ni l&apos;absence d&apos;erreurs.
              </p>
              <p className="text-body text-gray">
                L&apos;editeur decline toute responsabilite pour les eventuels dommages
                resultant de l&apos;utilisation du site ou de l&apos;impossibilite d&apos;y acceder.
              </p>
            </section>

            <section>
              <h2 className="font-display text-t2 text-dark mb-4">7. Droit applicable</h2>
              <p className="text-body text-gray">
                Les presentes mentions legales sont regies par le droit francais.
                En cas de litige, les tribunaux francais seront seuls competents.
              </p>
            </section>
          </div>

          <p className="text-small text-gray mt-10">
            Derniere mise a jour : {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
