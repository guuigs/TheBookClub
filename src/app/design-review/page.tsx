"use client";

import Image from "next/image";
import { Star, MessageCircle, ChevronRight } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { RatingStars } from "@/components/ui";
// Design review page - uses hardcoded demo data
const book = {
  title: "Notre-Dame de Paris",
  coverUrl: "/images/covers/notre-dame.jpg",
};
const avgRating = 8.5;
const totalVotes = 2341;
const myRating = 8;                   // note personnelle simulée

// ─── Helpers ──────────────────────────────────────────────────────────────
function OrangeStars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  const stars = 5;
  const filled = (rating / 10) * stars;
  return (
    <div className="flex gap-1">
      {Array.from({ length: stars }).map((_, i) => {
        const pct = Math.min(Math.max((filled - i) * 100, 0), 100);
        return (
          <div key={i} className={`relative ${sizes[size]}`}>
            <Star className={`${sizes[size]} text-primary/30 fill-transparent stroke-primary/30`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
              <Star className={`${sizes[size]} text-primary fill-primary`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyStars({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sizes[size]} text-white/25 fill-transparent stroke-white/25`} />
      ))}
    </div>
  );
}

// ─── Option A ─────────────────────────────────────────────────────────────
function AHover({ rated }: { rated: boolean }) {
  return (
    <div className="relative w-[185px] h-[278px] bg-cream overflow-hidden rounded-sm">
      <Image src={book.coverUrl!} alt={book.title} fill className="object-cover" sizes="185px" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1">
        {rated ? (
          <>
            <OrangeStars rating={myRating} size="sm" />
            <span className="text-primary font-semibold text-[13px]">{myRating}/10</span>
          </>
        ) : (
          <>
            <RatingStars rating={avgRating} size="sm" variant="light" />
            <span className="text-white font-semibold text-[13px]">{avgRating}/10</span>
          </>
        )}
        <div className="flex items-center gap-1 text-white/70 text-[11px]">
          <MessageCircle className="w-3 h-3" />
          <span>{totalVotes} avis</span>
        </div>
      </div>
    </div>
  );
}

function APage({ rated }: { rated: boolean }) {
  return (
    <div className="flex flex-col gap-3 w-[200px]">
      {rated ? (
        <>
          <p className="text-t2 font-semibold text-primary">{myRating}/10</p>
          <OrangeStars rating={myRating} size="lg" />
        </>
      ) : (
        <>
          <p className="text-t2 font-semibold text-dark">{avgRating}/10</p>
          <RatingStars rating={avgRating} size="lg" />
        </>
      )}
      <p className="text-body font-medium text-primary">{totalVotes} votants</p>
      <div className="w-full h-px bg-gray/20" />
      <p className="text-small text-gray font-medium">{rated ? `Moyenne : ${avgRating}/10` : "Pas encore noté"}</p>
    </div>
  );
}

// ─── Option B ─────────────────────────────────────────────────────────────
function BHover({ rated }: { rated: boolean }) {
  return (
    <div className="relative w-[185px] h-[278px] bg-cream overflow-hidden rounded-sm">
      <Image src={book.coverUrl!} alt={book.title} fill className="object-cover" sizes="185px" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/10 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex flex-col items-center gap-2">
        {rated ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-primary font-semibold text-[28px] leading-none">{myRating}</span>
              <span className="text-primary/60 text-[13px] font-medium">/10</span>
            </div>
            <OrangeStars rating={myRating} size="sm" />
            <span className="text-white/50 text-[10px] tracking-wide uppercase font-medium">
              moy. {avgRating}/10
            </span>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-white font-semibold text-[28px] leading-none">{avgRating}</span>
              <span className="text-white/50 text-[13px] font-medium">/10</span>
            </div>
            <RatingStars rating={avgRating} size="sm" variant="light" />
            <span className="text-white/60 text-[10px] tracking-wide uppercase font-medium">moyenne publique</span>
          </>
        )}
      </div>
    </div>
  );
}

function BPage({ rated }: { rated: boolean }) {
  return (
    <div className="flex flex-col gap-4 w-[200px]">
      {rated ? (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[44px] font-semibold text-primary leading-none">{myRating}</span>
            <span className="text-[20px] text-primary/50 font-medium">/10</span>
          </div>
          <OrangeStars rating={myRating} size="lg" />
          <p className="text-small font-medium text-gray tracking-wide uppercase">
            ma note · moy. {avgRating}/10
          </p>
        </>
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[44px] font-semibold text-dark leading-none">{avgRating}</span>
            <span className="text-[20px] text-gray font-medium">/10</span>
          </div>
          <RatingStars rating={avgRating} size="lg" />
          <p className="text-small font-medium text-gray tracking-wide uppercase">{totalVotes} votants · moyenne</p>
          <div className="w-full h-px bg-gray/20" />
          <button className="flex items-center gap-2 text-primary text-sm font-medium">
            <Star className="w-4 h-4" />
            Donner ma note
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Option C ─────────────────────────────────────────────────────────────
function CHover({ rated }: { rated: boolean }) {
  return (
    <div className="relative w-[185px] h-[278px] bg-cream overflow-hidden rounded-sm">
      <Image src={book.coverUrl!} alt={book.title} fill className="object-cover" sizes="185px" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
        {/* Ma note — top */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">Ma note</span>
          {rated ? (
            <div className="flex items-center gap-2">
              <OrangeStars rating={myRating} size="sm" />
              <span className="text-primary font-semibold text-[14px] leading-none">{myRating}/10</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <EmptyStars size="sm" />
              <span className="text-white/40 text-[11px] font-medium">—</span>
            </div>
          )}
        </div>
        {/* Separator */}
        <div className="w-full h-px bg-white/20" />
        {/* Moyenne — bottom */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">Moyenne</span>
          <div className="flex items-center gap-2">
            <RatingStars rating={avgRating} size="sm" variant="light" />
            <span className="text-white font-semibold text-[13px] leading-none">{avgRating}/10</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CPage({ rated }: { rated: boolean }) {
  return (
    <div className="flex flex-col gap-4 w-[200px]">
      {/* Ma note — top */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-gray tracking-widest uppercase">Ma note</p>
        {rated ? (
          <>
            <p className="text-t2 font-semibold text-primary tracking-tight">{myRating}/10</p>
            <OrangeStars rating={myRating} size="md" />
          </>
        ) : (
          <>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5 text-gray/30 fill-transparent stroke-gray/30" />
              ))}
            </div>
            <p className="text-small text-gray italic">Pas encore noté</p>
          </>
        )}
      </div>
      {/* Separator */}
      <div className="w-full h-px bg-gray/20" />
      {/* Moyenne — bottom */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-gray tracking-widest uppercase">Moyenne publique</p>
        <p className="text-t2 font-semibold text-dark tracking-tight">{avgRating}/10</p>
        <RatingStars rating={avgRating} size="md" />
        <p className="text-small text-primary font-medium">{totalVotes} votants</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
const options = [
  { id: "A", name: "Minimaliste", Hover: AHover, Page: APage },
  { id: "B", name: "Score centré", Hover: BHover, Page: BPage },
  { id: "C", name: "Deux blocs distincts", Hover: CHover, Page: CPage },
];

export default function DesignReviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 py-10 lg:py-[80px]">
        <div className="flex flex-col gap-2 mb-12">
          <h1 className="font-display text-t1 text-dark tracking-tight">
            Comparatif affichage des notes
          </h1>
          <p className="text-body text-gray font-medium">
            {book.title} · moyenne publique {avgRating}/10 · ma note simulée {myRating}/10
          </p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[120px_1fr_1fr_1fr_1fr] gap-6 mb-6 pl-0">
          <div />
          <p className="text-[11px] font-semibold text-gray tracking-widest uppercase text-center">Hover · non noté</p>
          <p className="text-[11px] font-semibold text-gray tracking-widest uppercase text-center">Hover · noté ({myRating}/10)</p>
          <p className="text-[11px] font-semibold text-gray tracking-widest uppercase text-center">Sidebar · non noté</p>
          <p className="text-[11px] font-semibold text-gray tracking-widest uppercase text-center">Sidebar · noté ({myRating}/10)</p>
        </div>

        <div className="flex flex-col gap-10">
          {options.map(({ id, name, Hover, Page }) => (
            <div key={id} className="grid grid-cols-[120px_1fr_1fr_1fr_1fr] gap-6 items-start">
              {/* Label */}
              <div className="flex flex-col gap-1 pt-2">
                <span className="w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center text-sm font-semibold">
                  {id}
                </span>
                <p className="text-small font-semibold text-dark tracking-tight mt-1">{name}</p>
              </div>

              {/* Hover — non noté */}
              <div className="flex justify-center">
                <Hover rated={false} />
              </div>

              {/* Hover — noté */}
              <div className="flex justify-center">
                <Hover rated={true} />
              </div>

              {/* Sidebar — non noté */}
              <div className="flex justify-center">
                <div className="border border-gray/10 rounded-xl p-5 bg-white shadow-sm w-full">
                  <Page rated={false} />
                </div>
              </div>

              {/* Sidebar — noté */}
              <div className="flex justify-center">
                <div className="border border-gray/10 rounded-xl p-5 bg-white shadow-sm w-full">
                  <Page rated={true} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
