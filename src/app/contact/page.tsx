"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";

function ContactForm() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");
  const isModification = subjectParam === "modification";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(isModification ? "Demande de modification d'une fiche livre" : "");
  const [message, setMessage] = useState("");

  // Book modification fields
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookGenre, setBookGenre] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookCoverUrl, setBookCoverUrl] = useState("");
  const [bookCorrections, setBookCorrections] = useState("");

  useEffect(() => {
    if (isModification) {
      setSubject("Demande de modification d'une fiche livre");
    }
  }, [isModification]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message envoyé ! Nous vous répondrons dans les plus brefs délais.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    if (isModification) {
      setBookTitle("");
      setBookAuthor("");
      setBookDate("");
      setBookGenre("");
      setBookDescription("");
      setBookCoverUrl("");
      setBookCorrections("");
    }
  };

  const inputClass = "px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-6">
          {isModification ? "Proposer une modification" : "Contact"}
        </h1>
        <p className="text-body text-gray mb-[60px]">
          {isModification
            ? "Vous souhaitez corriger ou compléter la fiche d'un livre ? Remplissez ce formulaire et nous traiterons votre demande."
            : "Une question, une suggestion ou un problème ? N'hésitez pas à nous contacter."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-body font-medium text-dark">
                Nom
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
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
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="subject" className="text-body font-medium text-dark">
              Sujet
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {/* Book modification fields */}
          {isModification && (
            <div className="flex flex-col gap-6 p-6 bg-gray/5 rounded-xl border border-gray/20">
              <h2 className="font-display text-t3 text-dark tracking-tight">Informations du livre</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="bookTitle" className="text-body font-medium text-dark">
                    Titre
                  </label>
                  <input
                    id="bookTitle"
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="Titre du livre"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="bookAuthor" className="text-body font-medium text-dark">
                    Auteur
                  </label>
                  <input
                    id="bookAuthor"
                    type="text"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="Nom de l'auteur"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="bookDate" className="text-body font-medium text-dark">
                    Date de parution
                  </label>
                  <input
                    id="bookDate"
                    type="text"
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    placeholder="ex. 1984"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="bookGenre" className="text-body font-medium text-dark">
                    Genre
                  </label>
                  <input
                    id="bookGenre"
                    type="text"
                    value={bookGenre}
                    onChange={(e) => setBookGenre(e.target.value)}
                    placeholder="ex. Roman, Science-fiction..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="bookDescription" className="text-body font-medium text-dark">
                  Description
                </label>
                <textarea
                  id="bookDescription"
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="Synopsis ou description du livre..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="bookCoverUrl" className="text-body font-medium text-dark">
                  Lien couverture
                </label>
                <input
                  id="bookCoverUrl"
                  type="url"
                  value={bookCoverUrl}
                  onChange={(e) => setBookCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="bookCorrections" className="text-body font-medium text-dark">
                  Commentaires / corrections
                </label>
                <textarea
                  id="bookCorrections"
                  value={bookCorrections}
                  onChange={(e) => setBookCorrections(e.target.value)}
                  placeholder="Décrivez les corrections ou informations manquantes..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          )}

          {!isModification && (
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-body font-medium text-dark">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className={`${inputClass} resize-none`}
              />
            </div>
          )}

          <Button type="submit" variant="primary" className="w-fit">
            Envoyer le message
          </Button>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-body text-gray">Chargement...</p>
        </div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  );
}
