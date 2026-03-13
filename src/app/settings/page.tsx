"use client";

import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { Button, Avatar } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { Camera } from "lucide-react";

export default function SettingsPage() {
  const { profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(profile?.bio ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save - would call API in real app
    alert("Paramètres sauvegardés !");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-[60px]">
          Paramètres
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          {/* Avatar Section */}
          <section className="flex flex-col gap-5">
            <h2 className="text-t4 font-semibold text-dark">Photo de profil</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar
                  src={profile?.avatar_url ?? undefined}
                  alt={profile?.display_name ?? "Profil"}
                  size="xl"
                  className="w-[120px] h-[120px]"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <Button type="button" variant="secondary">
                  Changer la photo
                </Button>
                <p className="text-small text-gray">JPG, PNG. Max 2MB</p>
              </div>
            </div>
          </section>

          {/* Profile Info Section */}
          <section className="flex flex-col gap-5">
            <h2 className="text-t4 font-semibold text-dark">Informations du profil</h2>

            <div className="flex flex-col gap-2">
              <label htmlFor="displayName" className="text-body font-medium text-dark">
                Nom d&apos;affichage
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
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
                onChange={(e) => setUsername(e.target.value)}
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="bio" className="text-body font-medium text-dark">
                Biographie
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Parlez-nous de vous..."
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </section>

          {/* Password Section */}
          <section className="flex flex-col gap-5">
            <h2 className="text-t4 font-semibold text-dark">Mot de passe</h2>
            <Button type="button" variant="secondary" className="w-fit">
              Changer le mot de passe
            </Button>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-5 border-t border-cream">
            <Button type="submit" variant="primary">
              Sauvegarder les modifications
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
