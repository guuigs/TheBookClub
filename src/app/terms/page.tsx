import { Header, Footer } from "@/components/layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'Utilisation | The Book Club",
  description: "Conditions generales d'utilisation du site The Book Club",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 py-10">
        <div className="w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto">
          <h1 className="font-display text-t1 text-dark tracking-tight mb-8">
            Conditions Generales d&apos;Utilisation
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-body text-gray mb-8">
              En utilisant le site The Book Club, vous acceptez les presentes
              conditions generales d&apos;utilisation. Veuillez les lire attentivement.
            </p>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">1. Objet du service</h2>
              <p className="text-body text-gray">
                The Book Club est une plateforme communautaire permettant aux utilisateurs
                de decouvrir des livres, partager leurs lectures, noter et commenter des
                ouvrages, creer des listes de lecture et interagir avec d&apos;autres lecteurs.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">2. Inscription</h2>
              <p className="text-body text-gray mb-4">
                Pour utiliser les fonctionnalites du site, vous devez creer un compte en
                fournissant des informations exactes et a jour.
              </p>
              <p className="text-body text-gray mb-4">
                Vous etes responsable de la confidentialite de vos identifiants de connexion
                et de toutes les activites effectuees sous votre compte.
              </p>
              <p className="text-body text-gray">
                Vous devez avoir au moins 13 ans pour creer un compte. Si vous avez entre
                13 et 16 ans, vous devez avoir l&apos;autorisation de vos parents ou tuteurs legaux.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">3. Regles de conduite</h2>
              <p className="text-body text-gray mb-4">
                En utilisant The Book Club, vous vous engagez a :
              </p>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li>Respecter les autres utilisateurs</li>
                <li>Ne pas publier de contenu illegal, diffamatoire, haineux ou discriminatoire</li>
                <li>Ne pas harceler ou intimider d&apos;autres membres</li>
                <li>Ne pas publier de spam ou de contenu promotionnel non sollicite</li>
                <li>Ne pas usurper l&apos;identite d&apos;une autre personne</li>
                <li>Ne pas tenter de compromettre la securite du site</li>
                <li>Respecter les droits d&apos;auteur et la propriete intellectuelle</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">4. Contenu utilisateur</h2>
              <p className="text-body text-gray mb-4">
                Vous conservez les droits sur le contenu que vous publiez (commentaires,
                critiques, listes). En publiant du contenu, vous accordez a The Book Club
                une licence non exclusive pour afficher ce contenu sur la plateforme.
              </p>
              <p className="text-body text-gray">
                Nous nous reservons le droit de supprimer tout contenu qui viole ces
                conditions ou que nous jugeons inapproprie.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">5. Propriete intellectuelle</h2>
              <p className="text-body text-gray mb-4">
                Le site The Book Club, son design, son code et son contenu original sont
                proteges par le droit d&apos;auteur.
              </p>
              <p className="text-body text-gray">
                Les informations sur les livres (titres, auteurs, descriptions, couvertures)
                proviennent de sources tierces (Google Books API) et appartiennent a leurs
                proprietaires respectifs.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">6. Gratuite du service</h2>
              <p className="text-body text-gray">
                L&apos;utilisation de The Book Club est gratuite. Nous pouvons proposer des
                fonctionnalites optionnelles payantes a l&apos;avenir, mais les fonctionnalites
                de base resteront gratuites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">7. Disponibilite du service</h2>
              <p className="text-body text-gray">
                Nous nous efforcons de maintenir le site accessible 24h/24, mais ne
                garantissons pas une disponibilite ininterrompue. Des interruptions
                peuvent survenir pour maintenance ou pour des raisons techniques.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">8. Limitation de responsabilite</h2>
              <p className="text-body text-gray mb-4">
                The Book Club est fourni &quot;tel quel&quot;. Nous ne garantissons pas :
              </p>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li>L&apos;exactitude des informations sur les livres</li>
                <li>La disponibilite continue du service</li>
                <li>L&apos;absence de bugs ou d&apos;erreurs</li>
              </ul>
              <p className="text-body text-gray mt-4">
                Nous ne sommes pas responsables des contenus publies par les utilisateurs
                ni des dommages resultant de l&apos;utilisation du site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">9. Suspension et resiliation</h2>
              <p className="text-body text-gray mb-4">
                Nous nous reservons le droit de suspendre ou supprimer votre compte en cas
                de violation de ces conditions, sans preavis.
              </p>
              <p className="text-body text-gray">
                Vous pouvez supprimer votre compte a tout moment en nous contactant.
                Vos donnees seront supprimees conformement a notre{" "}
                <a href="/privacy" className="text-primary underline hover:opacity-80">
                  politique de confidentialite
                </a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">10. Modifications</h2>
              <p className="text-body text-gray">
                Nous pouvons modifier ces conditions a tout moment. Les modifications
                entrent en vigueur des leur publication sur le site. En continuant a
                utiliser le service apres une modification, vous acceptez les nouvelles
                conditions.
              </p>
            </section>

            <section>
              <h2 className="font-display text-t2 text-dark mb-4">11. Droit applicable</h2>
              <p className="text-body text-gray">
                Ces conditions sont regies par le droit francais. Tout litige sera soumis
                aux tribunaux competents en France.
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
