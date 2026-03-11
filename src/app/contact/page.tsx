"use client";

import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { currentUser } from "@/lib/data";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message envoyé ! Nous vous répondrons dans les plus brefs délais.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={currentUser} />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 lg:py-[80px]">
        <h1 className="font-display text-t1 text-dark tracking-tight mb-6">
          Contact
        </h1>
        <p className="text-body text-gray mb-[60px]">
          Une question, une suggestion ou un problème ? N&apos;hésitez pas à nous contacter.
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
                required
                className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

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
              className="px-4 py-3 border border-gray/30 rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <Button type="submit" variant="primary" className="w-fit">
            Envoyer le message
          </Button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
