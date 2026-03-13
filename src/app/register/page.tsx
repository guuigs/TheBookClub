"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation.");
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, username.trim(), displayName.trim());
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      router.push("/login?registered=1");
    }
  };

  const inputCls =
    "px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <h1 className="font-display text-t1 text-dark tracking-tight mb-4 text-center">
            Rejoindre le Club
          </h1>
          <p className="text-body text-gray text-center mb-8">
            Créez votre compte pour rejoindre notre communauté de lecteurs.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

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
                maxLength={50}
                placeholder="Votre nom"
                className={inputCls}
                autoComplete="name"
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
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                required
                maxLength={30}
                placeholder="votre_pseudo"
                pattern="^[a-z0-9_]+$"
                title="Lettres minuscules, chiffres et underscores uniquement"
                className={inputCls}
                autoComplete="username"
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
                maxLength={255}
                placeholder="votre@email.com"
                className={inputCls}
                autoComplete="email"
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
                minLength={8}
                maxLength={128}
                placeholder="••••••••"
                className={inputCls}
                autoComplete="new-password"
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
                maxLength={128}
                placeholder="••••••••"
                className={inputCls}
                autoComplete="new-password"
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

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer mon compte"}
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
