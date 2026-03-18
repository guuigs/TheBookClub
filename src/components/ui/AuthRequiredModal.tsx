"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "./Button";
import { setAuthModalCallback } from "@/context/AuthContext";

export function AuthRequiredModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setAuthModalCallback(() => setIsOpen(true));
    return () => setAuthModalCallback(() => {});
  }, []);

  if (!isOpen) return null;

  const handleLogin = () => {
    setIsOpen(false);
    router.push("/login");
  };

  const handleRegister = () => {
    setIsOpen(false);
    router.push("/register");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-[400px] w-full mx-4 p-8">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray hover:text-dark transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="flex flex-col items-center gap-1 mb-6">
            <span className="font-display text-sm text-dark">The</span>
            <span className="font-sans font-normal text-[32px] text-dark leading-none tracking-tight">
              BOOK
            </span>
            <span className="font-display text-sm text-dark">Club</span>
          </div>

          <h2 className="text-t3 font-semibold text-dark mb-3">
            Rejoignez le club
          </h2>

          <p className="text-body text-gray mb-8">
            Connectez-vous pour noter, commenter, suivre des membres et creer vos listes de lecture.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="primary"
              size="lg"
              onClick={handleLogin}
              className="w-full"
            >
              Se connecter
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleRegister}
              className="w-full"
            >
              Creer un compte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
