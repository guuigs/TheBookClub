"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button, Avatar, useToast } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, uploadAvatar } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/browser";
import { Camera, Download, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/user/export-data");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `the-book-club-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Donnees exportees avec succes !");
    } catch (error) {
      toast.error("Erreur lors de l'export des donnees");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await updateProfile({
      display_name: displayName,
      username: username,
      bio: bio,
    });

    if (error) {
      toast.error(error);
    } else {
      toast.success("Profil mis a jour !");
      refreshProfile();
    }

    setIsSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    const { url, error } = await uploadAvatar(file);
    setIsUploadingAvatar(false);

    if (error) {
      toast.error(error);
      setAvatarPreview(null);
    } else if (url) {
      toast.success("Photo mise a jour !");
      refreshProfile();
    }
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
                  src={avatarPreview ?? profile?.avatar_url ?? undefined}
                  alt={profile?.display_name ?? "Profil"}
                  size="xl"
                  className="w-[120px] h-[120px]"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploadingAvatar}
                >
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
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              onClick={() => setShowPasswordModal(true)}
            >
              Changer le mot de passe
            </Button>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-5 border-t border-cream">
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Sauvegarder les modifications
            </Button>
          </div>
        </form>

        {/* RGPD Section */}
        <section className="mt-16 pt-10 border-t border-cream">
          <h2 className="text-t3 font-semibold text-dark mb-2">Vos donnees personnelles</h2>
          <p className="text-body text-gray mb-6">
            Conformement au RGPD, vous pouvez exporter ou supprimer vos donnees a tout moment.
          </p>

          <div className="flex flex-col gap-4">
            {/* Export Data */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-beige/30 rounded-lg">
              <div>
                <h3 className="text-body font-semibold text-dark">Exporter mes donnees</h3>
                <p className="text-small text-gray">
                  Telecharger une copie de toutes vos donnees au format JSON.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportData}
                isLoading={isExporting}
                className="shrink-0"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-red-50 rounded-lg border border-red-100">
              <div>
                <h3 className="text-body font-semibold text-dark">Supprimer mon compte</h3>
                <p className="text-small text-gray">
                  Cette action est irreversible. Toutes vos donnees seront supprimees.
                </p>
              </div>
              <Button
                variant="discrete"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="shrink-0 !text-red-600 hover:!bg-red-100"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => router.push("/")}
        />
      )}
    </div>
  );
}

function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caracteres");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsLoading(false);

    if (error) {
      toast.error("Erreur lors du changement de mot de passe");
    } else {
      toast.success("Mot de passe mis a jour !");
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        className="bg-white rounded-xl p-8 w-full max-w-[400px] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="password-modal-title" className="font-display text-t2 text-dark tracking-tight">
          Changer le mot de passe
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="text-body font-medium text-dark">
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={6}
            />
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
              className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={6}
            />
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button type="button" variant="discrete" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Mettre a jour
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteAccountModal({
  onClose,
  onDeleted,
}: {
  onClose: () => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "SUPPRIMER") {
      toast.error("Veuillez taper SUPPRIMER pour confirmer");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      toast.success("Compte supprime. Au revoir !");
      onDeleted();
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="bg-white rounded-xl p-8 w-full max-w-[450px] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 id="delete-modal-title" className="font-display text-t2 text-dark tracking-tight">
              Supprimer votre compte
            </h2>
            <p className="text-body text-gray mt-2">
              Cette action est <strong>definitive et irreversible</strong>. Toutes vos
              donnees seront supprimees : profil, notes, commentaires, listes et abonnements.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmDelete" className="text-body font-medium text-dark">
            Tapez <strong>SUPPRIMER</strong> pour confirmer
          </label>
          <input
            id="confirmDelete"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="SUPPRIMER"
            className="px-4 py-3 border border-red-200 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            disabled={confirmText !== "SUPPRIMER"}
            className="!bg-red-600 hover:!bg-red-700"
          >
            Supprimer definitivement
          </Button>
        </div>
      </div>
    </div>
  );
}
