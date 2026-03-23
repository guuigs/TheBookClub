import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { Heart, Coffee, ExternalLink } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main id="main-content" className="flex-1 flex items-center justify-center px-5 py-10 lg:py-[80px]">
        <div className="w-full max-w-[600px] text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-primary/10 rounded-full">
              <Heart className="w-16 h-16 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-t1 text-dark tracking-tight mb-4">
            Me soutenir
          </h1>

          {/* Description */}
          <p className="text-body text-gray mb-8 leading-relaxed max-w-[500px] mx-auto">
            Le Book Club est un projet independant, porte par une seule personne.
            Les serveurs, la maintenance et le developpement me prennent beaucoup
            de temps et d&apos;argent. Si vous appreciez ce projet, vous pouvez
            m&apos;aider a le faire vivre.
          </p>

          {/* Buy Me a Coffee Button */}
          <a
            href="https://buymeacoffee.com/thebookclub.donation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-dark font-semibold rounded-lg transition-colors text-body"
          >
            <Coffee className="w-6 h-6" />
            <span>M&apos;offrir un cafe</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Thank you message */}
          <p className="text-small text-gray mt-8">
            Merci pour votre soutien !
          </p>

          {/* Contact link */}
          <div className="mt-10 pt-8 border-t border-cream">
            <p className="text-body text-gray">
              Des questions ?{" "}
              <Link href="/contact" className="text-primary underline hover:opacity-80">
                Contactez-moi
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
