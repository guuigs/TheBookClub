"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    // Always show success to avoid user enumeration
    setSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <h1 className="font-display text-t1 text-dark tracking-tight mb-4 text-center">
            Mot de passe oublié
          </h1>

          {!submitted ? (
            <>
              <p className="text-body text-gray text-center mb-8">
                Entrez votre adresse email et nous vous enverrons un lien pour
                réinitialiser votre mot de passe.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                    className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                  {isLoading ? "Envoi..." : "Envoyer le lien"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✉️</span>
              </div>
              <p className="text-body text-dark mb-2">Email envoyé !</p>
              <p className="text-body text-gray mb-8">
                Si un compte existe avec l&apos;adresse {email}, vous recevrez un
                email avec les instructions de réinitialisation.
              </p>
            </div>
          )}

          <p className="text-body text-gray text-center mt-8">
            <Link href="/login" className="text-primary underline hover:opacity-80">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
