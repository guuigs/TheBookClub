"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { href: "/books", label: "livres" },
    { href: "/lists", label: "listes" },
    { href: "/members", label: "membres du club" },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white w-full z-50 border-b border-cream">
      <div className="max-w-[1500px] mx-auto px-5 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image src="/images/logo.svg" alt="The Book Club" width={55} height={36} className="object-contain" priority />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" aria-hidden="true" />
              <input
                type="text"
                aria-label="Rechercher un livre"
                placeholder="Rechercher un livre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-5 py-2 bg-gray/10 text-dark placeholder:text-gray border border-gray/20 rounded-lg text-body tracking-tight w-[280px] focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>

            {/* Nav Links */}
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-body font-medium tracking-tight transition-colors hover:text-primary ${
                    isActive(link.href) ? "text-primary" : "text-dark"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User Avatar / Login */}
            {user && profile ? (
              <div className="flex items-center gap-3">
                <Link href={`/profile/${user.id}`} aria-label={`Profil de ${profile.username}`}>
                  <Avatar
                    src={profile.avatar_url ?? undefined}
                    alt={profile.username}
                    size="md"
                  />
                </Link>
                <button
                  onClick={handleSignOut}
                  aria-label="Se déconnecter"
                  className="text-gray hover:text-dark transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-body font-medium tracking-tight text-dark hover:text-primary transition-colors"
              >
                connexion
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-dark" />
            ) : (
              <Menu className="w-6 h-6 text-dark" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-cream pt-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" aria-hidden="true" />
              <input
                type="text"
                aria-label="Rechercher un livre"
                placeholder="Rechercher un livre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-2 bg-gray/10 text-dark placeholder:text-gray border border-gray/20 rounded-lg text-body tracking-tight focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-body font-medium tracking-tight py-2 transition-colors ${
                    isActive(link.href) ? "text-primary" : "text-dark"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && profile ? (
                <>
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center gap-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Avatar
                      src={profile.avatar_url ?? undefined}
                      alt={profile.username}
                      size="md"
                    />
                    <span className="text-body font-medium text-dark">
                      {profile.username}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 py-2 text-body font-medium text-gray hover:text-dark"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-body font-medium tracking-tight text-dark py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  connexion
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
