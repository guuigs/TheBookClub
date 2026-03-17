"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Input, Button, useToast } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";
import { useAuth } from "@/context/AuthContext";

interface BookData {
  id: string;
  title: string;
  author_name: string;
}

export default function SuggestModificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    field: "",
    currentValue: "",
    suggestedValue: "",
    reason: "",
  });

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("books_with_stats")
      .select("id, title, author_name")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setBook(data ?? null);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vous devez etre connecte pour suggerer une modification.");
      return;
    }

    if (!formData.field || !formData.suggestedValue) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from("book_modification_suggestions").insert({
      book_id: id,
      user_id: user.id,
      field_name: formData.field,
      current_value: formData.currentValue,
      suggested_value: formData.suggestedValue,
      reason: formData.reason || null,
    });

    if (error) {
      toast.error("Erreur lors de l'envoi de la suggestion.");
    } else {
      toast.success("Suggestion envoyee avec succes !");
      router.push(`/livres/${id}`);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-body text-gray">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-t3 text-dark">Livre non trouve</p>
        </main>
        <Footer />
      </div>
    );
  }

  const fieldOptions = [
    { value: "title", label: "Titre" },
    { value: "author", label: "Auteur" },
    { value: "description", label: "Synopsis" },
    { value: "genre", label: "Genre" },
    { value: "published_year", label: "Annee de publication" },
    { value: "cover", label: "Couverture" },
    { value: "other", label: "Autre" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[700px] mx-auto px-5 py-10 lg:py-[80px]">
        <Link
          href={`/livres/${id}`}
          className="inline-flex items-center gap-2 text-body font-medium text-gray hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au livre
        </Link>

        <div className="flex flex-col gap-3 mb-10">
          <h1 className="font-display text-t2 text-dark tracking-tight">
            Suggerer une modification
          </h1>
          <p className="text-body text-gray">
            {book.title} par {book.author_name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="field" className="text-body font-medium text-dark tracking-tight">
              Champ a modifier *
            </label>
            <select
              id="field"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              className="w-full px-4 py-3 bg-gray/10 border border-gray/20 rounded-lg text-body text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selectionnez un champ</option>
              {fieldOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="currentValue" className="text-body font-medium text-dark tracking-tight">
              Valeur actuelle (si connue)
            </label>
            <Input
              id="currentValue"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
              placeholder="La valeur actuelle du champ"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="suggestedValue" className="text-body font-medium text-dark tracking-tight">
              Valeur suggeree *
            </label>
            <Input
              id="suggestedValue"
              value={formData.suggestedValue}
              onChange={(e) => setFormData({ ...formData, suggestedValue: e.target.value })}
              placeholder="La nouvelle valeur que vous suggerez"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="text-body font-medium text-dark tracking-tight">
              Raison de la modification
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Expliquez pourquoi cette modification est necessaire..."
              rows={4}
              className="w-full px-4 py-3 bg-gray/10 border border-gray/20 rounded-lg text-body text-dark placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={!formData.field || !formData.suggestedValue || submitting}
              isLoading={submitting}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer la suggestion
            </Button>
            <Link href={`/livres/${id}`}>
              <Button type="button" variant="secondary">
                Annuler
              </Button>
            </Link>
          </div>

          <p className="text-small text-gray">
            * Champs obligatoires. Votre suggestion sera examinee par l&apos;equipe de moderation.
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}
