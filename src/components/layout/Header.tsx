"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui";

interface HeaderProps {
  user?: {
    id: string;
    avatarUrl?: string;
    username: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
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

  return (
    <header className="bg-white w-full">
      <div className="max-w-[1500px] mx-auto px-5 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center gap-1 shrink-0">
            <span className="font-display text-[12px] text-dark text-center">
              The
            </span>
            <span className="font-sans font-normal text-[28px] text-dark leading-none tracking-tight">
              BOOK
            </span>
            <span className="font-display text-[12px] text-dark text-center">
              Club
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
              <input
                type="text"
                placeholder="Rechercher un livre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-5 py-3 bg-dark text-white placeholder:text-gray rounded-lg text-body tracking-tight w-[280px] focus:outline-none focus:ring-2 focus:ring-primary"
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
            {user ? (
              <Link href={`/profile/${user.id}`}>
                <Avatar
                  src={user.avatarUrl}
                  alt={user.username}
                  size="md"
                />
              </Link>
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
              <input
                type="text"
                placeholder="Rechercher un livre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-3 bg-dark text-white placeholder:text-gray rounded-lg text-body tracking-tight focus:outline-none focus:ring-2 focus:ring-primary"
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
              {user ? (
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.username}
                    size="md"
                  />
                  <span className="text-body font-medium text-dark">
                    {user.username}
                  </span>
                </Link>
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
