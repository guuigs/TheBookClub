import { Header, Footer } from "@/components/layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialite | The Book Club",
  description: "Politique de confidentialite et protection des donnees personnelles",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 py-10">
        <div className="w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto">
          <h1 className="font-display text-t1 text-dark tracking-tight mb-8">
            Politique de Confidentialite
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-body text-gray mb-8">
              The Book Club s&apos;engage a proteger votre vie privee. Cette politique
              explique comment nous collectons, utilisons et protegeons vos donnees
              personnelles conformement au Reglement General sur la Protection des
              Donnees (RGPD).
            </p>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">1. Responsable du traitement</h2>
              <p className="text-body text-gray">
                Le responsable du traitement des donnees est l&apos;editeur du site The Book Club.
                Pour toute question, vous pouvez nous contacter via la page{" "}
                <a href="/contact" className="text-primary underline hover:opacity-80">contact</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">2. Donnees collectees</h2>
              <p className="text-body text-gray mb-4">
                Nous collectons les donnees suivantes :
              </p>

              <h3 className="font-display text-t3 text-dark mb-2 mt-4">Donnees d&apos;inscription</h3>
              <ul className="text-body text-gray space-y-2 list-disc pl-5 mb-4">
                <li>Adresse email</li>
                <li>Mot de passe (stocke sous forme chiffree)</li>
                <li>Nom d&apos;utilisateur</li>
                <li>Nom d&apos;affichage</li>
              </ul>

              <h3 className="font-display text-t3 text-dark mb-2 mt-4">Donnees de profil (optionnelles)</h3>
              <ul className="text-body text-gray space-y-2 list-disc pl-5 mb-4">
                <li>Photo de profil</li>
                <li>Biographie</li>
              </ul>

              <h3 className="font-display text-t3 text-dark mb-2 mt-4">Donnees d&apos;utilisation</h3>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li>Notes attribuees aux livres</li>
                <li>Commentaires et critiques</li>
                <li>Listes de lecture creees</li>
                <li>Livres favoris</li>
                <li>Abonnements (personnes suivies)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">3. Finalites du traitement</h2>
              <p className="text-body text-gray mb-4">
                Vos donnees sont utilisees pour :
              </p>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li>Creer et gerer votre compte utilisateur</li>
                <li>Vous permettre d&apos;utiliser les fonctionnalites du site (notes, commentaires, listes)</li>
                <li>Afficher votre profil public aux autres membres</li>
                <li>Vous envoyer des communications liees a votre compte (si necessaire)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">4. Base legale du traitement</h2>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li><strong>Execution du contrat :</strong> Les donnees d&apos;inscription sont necessaires pour vous fournir le service</li>
                <li><strong>Consentement :</strong> Les donnees optionnelles de profil et vos contributions (commentaires, notes)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">5. Destinataires des donnees</h2>
              <p className="text-body text-gray mb-4">
                Vos donnees sont accessibles a :
              </p>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li><strong>Vous-meme</strong> via votre espace personnel</li>
                <li><strong>Les autres membres</strong> pour les donnees publiques (profil, commentaires, notes)</li>
                <li><strong>Nos sous-traitants techniques :</strong>
                  <ul className="mt-2 ml-5 list-circle">
                    <li>Supabase (hebergement base de donnees - USA, clauses contractuelles types)</li>
                    <li>Vercel (hebergement site web - USA, clauses contractuelles types)</li>
                  </ul>
                </li>
              </ul>
              <p className="text-body text-gray mt-4">
                <strong>Nous ne vendons jamais vos donnees a des tiers.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">6. Duree de conservation</h2>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li><strong>Donnees de compte :</strong> Conservees tant que votre compte est actif</li>
                <li><strong>Contributions publiques :</strong> Conservees meme apres suppression du compte (anonymisees)</li>
                <li><strong>Logs techniques :</strong> 30 jours maximum</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">7. Vos droits</h2>
              <p className="text-body text-gray mb-4">
                Conformement au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li><strong>Droit d&apos;acces :</strong> Obtenir une copie de vos donnees</li>
                <li><strong>Droit de rectification :</strong> Corriger vos donnees inexactes</li>
                <li><strong>Droit a l&apos;effacement :</strong> Demander la suppression de vos donnees</li>
                <li><strong>Droit a la portabilite :</strong> Recevoir vos donnees dans un format structure</li>
                <li><strong>Droit d&apos;opposition :</strong> Vous opposer a certains traitements</li>
                <li><strong>Droit de retirer votre consentement :</strong> A tout moment</li>
              </ul>
              <p className="text-body text-gray mt-4">
                Pour exercer ces droits, contactez-nous via la page{" "}
                <a href="/contact" className="text-primary underline hover:opacity-80">contact</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">8. Securite</h2>
              <p className="text-body text-gray">
                Nous mettons en oeuvre des mesures de securite appropriees pour proteger
                vos donnees : chiffrement des mots de passe, connexions HTTPS, controle
                d&apos;acces strict aux donnees (Row Level Security), headers de securite
                (CSP, HSTS).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">9. Cookies</h2>
              <p className="text-body text-gray">
                Nous utilisons uniquement des cookies essentiels au fonctionnement du site.
                Consultez notre{" "}
                <a href="/cookies" className="text-primary underline hover:opacity-80">
                  politique relative aux cookies
                </a>{" "}
                pour plus de details.
              </p>
            </section>

            <section>
              <h2 className="font-display text-t2 text-dark mb-4">10. Reclamation</h2>
              <p className="text-body text-gray">
                Si vous estimez que vos droits ne sont pas respectes, vous pouvez
                introduire une reclamation aupres de la CNIL (Commission Nationale
                de l&apos;Informatique et des Libertes) : <a href="https://www.cnil.fr"
                className="text-primary underline hover:opacity-80" target="_blank"
                rel="noopener noreferrer">www.cnil.fr</a>
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
