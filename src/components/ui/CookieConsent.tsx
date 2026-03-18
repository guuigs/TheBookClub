"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";

const COOKIE_CONSENT_KEY = "cookie-consent-accepted";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasAccepted) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-[600px] mx-auto bg-white rounded-xl shadow-lg border border-gray/20 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-t4 font-semibold text-dark">
              Cookies necessaires
            </h2>
            <p className="text-small text-gray leading-relaxed">
              Ce site utilise uniquement des cookies essentiels au bon fonctionnement
              de l&apos;application : authentification, preferences de session et securite.
              Aucun cookie publicitaire ou de tracking n&apos;est utilise.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAccept}
            >
              J&apos;accepte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
