"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { Check, X, Loader2 } from "lucide-react";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "too_short";

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
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  // Debounced username check
  const checkUsername = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameStatus(value.length > 0 ? "too_short" : "idle");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(value)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");

    try {
      const response = await fetch(`/api/user/check-username?username=${encodeURIComponent(value)}`);
      const data = await response.json();

      if (data.available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus(data.reason === "taken" ? "taken" : "invalid");
      }
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsername(username);
    }, 400);

    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Block if username is not available
    if (usernameStatus !== "available") {
      setError("Veuillez choisir un nom d'utilisateur valide et disponible.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
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

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
  };

  const inputCls =
    "px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary";

  const getUsernameInputClass = () => {
    const base = "px-4 py-3 border rounded-lg text-body focus:outline-none focus:ring-2";
    switch (usernameStatus) {
      case "available":
        return `${base} border-green-500 focus:ring-green-500`;
      case "taken":
      case "invalid":
        return `${base} border-red-500 focus:ring-red-500`;
      default:
        return `${base} border-gray/30 focus:ring-primary`;
    }
  };

  const renderUsernameStatus = () => {
    switch (usernameStatus) {
      case "checking":
        return (
          <span className="flex items-center gap-1 text-small text-gray">
            <Loader2 className="w-3 h-3 animate-spin" />
            Verification...
          </span>
        );
      case "available":
        return (
          <span className="flex items-center gap-1 text-small text-green-600">
            <Check className="w-3 h-3" />
            Disponible
          </span>
        );
      case "taken":
        return (
          <span className="flex items-center gap-1 text-small text-red-600">
            <X className="w-3 h-3" />
            Deja pris
          </span>
        );
      case "invalid":
        return (
          <span className="flex items-center gap-1 text-small text-red-600">
            <X className="w-3 h-3" />
            Lettres, chiffres et _ uniquement
          </span>
        );
      case "too_short":
        return (
          <span className="text-small text-gray">
            3 caracteres minimum
          </span>
        );
      default:
        return (
          <span className="text-small text-gray">
            Lettres minuscules, chiffres et underscores
          </span>
        );
    }
  };

  const isFormValid =
    displayName.trim() &&
    username.trim() &&
    usernameStatus === "available" &&
    email.trim() &&
    password.length >= 8 &&
    confirmPassword &&
    acceptTerms;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <h1 className="font-display text-t1 text-dark tracking-tight mb-4 text-center">
            Rejoindre le Club
          </h1>
          <p className="text-body text-gray text-center mb-8">
            Creez votre compte pour rejoindre notre communaute de lecteurs.
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

            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-body font-medium text-dark">
                Nom d&apos;utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                required
                maxLength={30}
                placeholder="votre_pseudo"
                className={getUsernameInputClass()}
                autoComplete="username"
              />
              <div className="h-5">
                {renderUsernameStatus()}
              </div>
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
              <span className="text-small text-gray">8 caracteres minimum</span>
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
                  politique de confidentialite
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Creation..." : "Creer mon compte"}
            </Button>
          </form>

          <p className="text-body text-gray text-center mt-8">
            Deja membre ?{" "}
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
