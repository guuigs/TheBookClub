"use client";

import Link from "next/link";

export function Footer() {
  const navLinks = [
    { href: "/contact", label: "Contact" },
    { href: "/books", label: "Livres" },
    { href: "/lists", label: "Listes" },
    { href: "/profile/1", label: "Profil" },
    { href: "/members", label: "Membres du club" },
  ];

  return (
    <footer className="bg-dark w-full">
      <div className="max-w-[1500px] mx-auto px-5 md:px-[60px] py-[60px]">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Left Section - Logo + Support Message */}
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* Logo */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="font-display text-[14px] text-white text-center">
                The
              </span>
              <span className="font-sans font-normal text-[36px] text-white leading-none tracking-tight">
                BOOK
              </span>
              <span className="font-display text-[14px] text-white text-center">
                Club
              </span>
            </div>

            {/* Support Message */}
            <div className="flex flex-col gap-5 max-w-[400px]">
              <p className="text-body font-medium text-white tracking-tight leading-relaxed">
                Le Book Club est un projet porté par une seule personne. Les
                serveurs, la maintenance, l&apos;entretien et l&apos;administration me
                prennent beaucoup de temps et d&apos;argent. N&apos;hésitez pas à me
                soutenir si vous le souhaitez et si vous le pouvez. Je vous
                remercie d&apos;avance.
              </p>
              <Link
                href="/support"
                className="text-t4 font-semibold text-white tracking-tight hover:text-primary transition-colors"
              >
                Me soutenir
              </Link>
            </div>
          </div>

          {/* Right Section - Navigation */}
          <nav className="flex flex-col items-start md:items-end gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-t4 font-semibold text-white tracking-tight hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright - Optional */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-small text-gray text-center md:text-left">
            © {new Date().getFullYear()} The Book Club. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
