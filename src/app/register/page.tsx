"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    if (!acceptTerms) {
      alert("Veuillez accepter les conditions d'utilisation");
      return;
    }
    // Mock registration
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={null} />

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <h1 className="font-display text-t1 text-dark tracking-tight mb-4 text-center">
            Rejoindre le Club
          </h1>
          <p className="text-body text-gray text-center mb-8">
            Créez votre compte pour rejoindre notre communauté de lecteurs.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="displayName" className="text-body font-medium text-dark">
                Nom d&apos;affichage
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="Votre nom"
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-body font-medium text-dark">
                Nom d&apos;utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="votre_pseudo"
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-body font-medium text-dark">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-body font-medium text-dark">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-body font-medium text-dark">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-primary"
              />
              <span className="text-small text-gray">
                J&apos;accepte les{" "}
                <Link href="/terms" className="text-primary underline">
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/privacy" className="text-primary underline">
                  politique de confidentialité
                </Link>
              </span>
            </label>

            <Button type="submit" variant="primary" className="w-full mt-2">
              Créer mon compte
            </Button>
          </form>

          <p className="text-body text-gray text-center mt-8">
            Déjà membre ?{" "}
            <Link href="/login" className="text-primary underline hover:opacity-80">
              Se connecter
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
