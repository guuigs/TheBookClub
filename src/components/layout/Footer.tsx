"use client";

import Link from "next/link";

export function Footer() {
  const navLinks = [
    { href: "/livres", label: "Livres" },
    { href: "/listes", label: "Listes" },
    { href: "/membres", label: "Membres" },
    { href: "/librairies", label: "Librairies" },
    { href: "/contact", label: "Contact" },
  ];

  const legalLinks = [
    { href: "/mentions-legales", label: "Mentions legales" },
    { href: "/privacy", label: "Confidentialite" },
    { href: "/terms", label: "CGU" },
    { href: "/cookies", label: "Cookies" },
  ];

  return (
    <footer className="bg-dark w-full">
      <div className="w-[320px] tablet:w-[700px] desktop:w-[1200px] mx-auto py-10">
        <div className="flex flex-col desktop:flex-row items-start justify-between gap-10">
          {/* Left Section - Logo + Support Message */}
          <div className="flex flex-col tablet:flex-row items-start gap-8 desktop:max-w-[500px]">
            {/* Logo */}
            <Link href="/" className="flex flex-col items-center gap-1 shrink-0">
              <span className="font-display text-[14px] text-white text-center">
                The
              </span>
              <span className="font-sans font-normal text-[28px] text-white leading-none tracking-tight">
                BOOK
              </span>
              <span className="font-display text-[14px] text-white text-center">
                Club
              </span>
            </Link>

            {/* Support Message */}
            <div className="flex flex-col gap-4">
              <p className="text-small text-white/80 leading-relaxed">
                Le Book Club est un projet independant. N&apos;hesitez pas a me
                soutenir si vous le souhaitez.
              </p>
              <Link
                href="/support"
                className="text-small font-semibold text-primary hover:text-white transition-colors w-fit"
              >
                Me soutenir
              </Link>
            </div>
          </div>

          {/* Right Section - Navigation Columns */}
          <div className="flex flex-col tablet:flex-row gap-10 tablet:gap-16">
            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              <h3 className="text-small font-semibold text-white mb-2">Navigation</h3>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-small text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Legal */}
            <nav className="flex flex-col gap-2">
              <h3 className="text-small font-semibold text-white mb-2">Legal</h3>
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-small text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-small text-white/50 text-center desktop:text-left">
            © {new Date().getFullYear()} The Book Club. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
