import { Header, Footer } from "@/components/layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique Cookies | The Book Club",
  description: "Politique relative aux cookies du site The Book Club",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 py-10">
        <div className="w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto">
          <h1 className="font-display text-t1 text-dark tracking-tight mb-8">
            Politique relative aux Cookies
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-body text-gray mb-8">
              Cette page explique comment The Book Club utilise les cookies et
              technologies similaires.
            </p>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
              <p className="text-body text-gray">
                Un cookie est un petit fichier texte stocke sur votre appareil (ordinateur,
                telephone, tablette) lorsque vous visitez un site web. Les cookies permettent
                au site de reconnaitre votre appareil et de memoriser certaines informations
                sur vos preferences ou actions passees.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">2. Types de cookies utilises</h2>

              <div className="bg-beige/30 rounded-lg p-5 mb-4">
                <h3 className="font-display text-t3 text-dark mb-2">Cookies strictement necessaires</h3>
                <p className="text-body text-gray mb-4">
                  Ces cookies sont essentiels au fonctionnement du site. Sans eux, vous ne
                  pourriez pas utiliser les fonctionnalites de base.
                </p>
                <table className="w-full text-small">
                  <thead>
                    <tr className="border-b border-gray/20">
                      <th className="text-left py-2 text-dark">Nom</th>
                      <th className="text-left py-2 text-dark">Finalite</th>
                      <th className="text-left py-2 text-dark">Duree</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray">
                    <tr className="border-b border-gray/10">
                      <td className="py-2"><code>sb-*-auth-token</code></td>
                      <td className="py-2">Authentification et session utilisateur</td>
                      <td className="py-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-green-50 rounded-lg p-5">
                <h3 className="font-display text-t3 text-dark mb-2">Ce que nous n&apos;utilisons PAS</h3>
                <ul className="text-body text-gray space-y-2 list-disc pl-5">
                  <li><strong>Cookies publicitaires :</strong> Aucun</li>
                  <li><strong>Cookies de tracking :</strong> Aucun</li>
                  <li><strong>Google Analytics :</strong> Non installe</li>
                  <li><strong>Pixels de suivi :</strong> Aucun</li>
                  <li><strong>Cookies tiers de reseaux sociaux :</strong> Aucun</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">3. Stockage local (localStorage)</h2>
              <p className="text-body text-gray mb-4">
                En plus des cookies, nous utilisons le stockage local de votre navigateur pour :
              </p>
              <table className="w-full text-small mb-4">
                <thead>
                  <tr className="border-b border-gray/20">
                    <th className="text-left py-2 text-dark">Cle</th>
                    <th className="text-left py-2 text-dark">Finalite</th>
                  </tr>
                </thead>
                <tbody className="text-gray">
                  <tr className="border-b border-gray/10">
                    <td className="py-2"><code>cookie-consent-accepted</code></td>
                    <td className="py-2">Memoriser votre acceptation de la banniere cookies</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">4. Gerer vos cookies</h2>
              <p className="text-body text-gray mb-4">
                Vous pouvez controler et supprimer les cookies via les parametres de votre
                navigateur. Voici comment faire pour les principaux navigateurs :
              </p>
              <ul className="text-body text-gray space-y-2 list-disc pl-5">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647"
                     className="text-primary underline hover:opacity-80"
                     target="_blank" rel="noopener noreferrer">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent"
                     className="text-primary underline hover:opacity-80"
                     target="_blank" rel="noopener noreferrer">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac"
                     className="text-primary underline hover:opacity-80"
                     target="_blank" rel="noopener noreferrer">
                    Safari
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                     className="text-primary underline hover:opacity-80"
                     target="_blank" rel="noopener noreferrer">
                    Microsoft Edge
                  </a>
                </li>
              </ul>
              <p className="text-body text-gray mt-4">
                <strong>Note :</strong> Si vous bloquez les cookies essentiels, vous ne pourrez
                pas vous connecter a votre compte.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-t2 text-dark mb-4">5. Consentement</h2>
              <p className="text-body text-gray">
                Etant donne que nous utilisons uniquement des cookies strictement necessaires
                au fonctionnement du service, votre consentement explicite n&apos;est pas requis
                selon la directive ePrivacy. Cependant, nous vous informons de leur utilisation
                via une banniere lors de votre premiere visite.
              </p>
            </section>

            <section>
              <h2 className="font-display text-t2 text-dark mb-4">6. Contact</h2>
              <p className="text-body text-gray">
                Pour toute question concernant notre utilisation des cookies,
                contactez-nous via la page{" "}
                <a href="/contact" className="text-primary underline hover:opacity-80">contact</a>.
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
