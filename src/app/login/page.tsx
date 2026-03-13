"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header, Footer } from "@/components/layout";
import { Input, Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-body font-medium text-dark tracking-tight">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={255}
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-body font-medium text-dark tracking-tight">
          Mot de passe
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          maxLength={128}
          autoComplete="current-password"
        />
      </div>
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-small font-medium text-primary hover:underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading}
        className="w-full mt-4"
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center gap-2 mb-10">
            <span className="font-display text-lg text-dark">The</span>
            <span className="font-sans font-normal text-[48px] text-dark leading-none tracking-tight">
              BOOK
            </span>
            <span className="font-display text-lg text-dark">Club</span>
          </div>

          <h1 className="text-t2 font-semibold text-dark text-center mb-8">
            Connexion
          </h1>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <div className="mt-8 text-center">
            <p className="text-body text-gray">
              Pas encore membre ?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Rejoindre le club
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
