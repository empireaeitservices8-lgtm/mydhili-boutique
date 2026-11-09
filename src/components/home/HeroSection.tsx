"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-hero",
  display: "swap",
});

const SLIDE_DURATION = 5500; // ms

type Slide = {
  eyebrow: string;
  title: string;
  accent: string;
  tail: string;
  copy: string;
  cta: string;
  href: string;
  caption: string;
  image: string;
};

// Best results: put your own photos in /public/hero and use
// "/hero/slide-1.jpg", etc. Any image that fails to load is skipped
// automatically, so the slider never shows a blank slide.
const slides: Slide[] = [
  {
    eyebrow: "The Art of Indian Elegance",
    title: "Tradition,",
    accent: "beautifully",
    tail: "reimagined.",
    copy: "Thoughtfully curated Indian fashion, from timeless sarees to contemporary everyday styles.",
    cta: "Explore Collection",
    href: "/shop",
    caption: "The Signature Edit",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=85",
  },
  {
    eyebrow: "Festive Season",
    title: "Woven in",
    accent: "silk & gold",
    tail: "for every occasion.",
    copy: "Rich textures and heirloom-inspired drapes, made for celebrations that deserve to be remembered.",
    cta: "Shop Festive",
    href: "/shop",
    caption: "Festive Sarees",
    image:
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1800&q=85",
  },
  {
    eyebrow: "Everyday Grace",
    title: "Effortless",
    accent: "comfort,",
    tail: "quietly elegant.",
    copy: "Lightweight kurtas and everyday styles that move with you from morning to evening.",
    cta: "Shop Everyday",
    href: "/shop",
    caption: "Everyday Wear",
    image:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1800&q=85",
  },
  {
    eyebrow: "New Arrivals",
    title: "Fresh",
    accent: "stories",
    tail: "just unfolded.",
    copy: "Be the first to discover the latest pieces added to the Mydhili collection.",
    cta: "See What's New",
    href: "/shop",
    caption: "New Arrivals",
    image:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1800&q=85",
  },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [failed, setFailed] = useState<number[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const markFailed = useCallback((index: number) => {
    setFailed((prev) => (prev.includes(index) ? prev : [...prev, index]));
  }, []);

  // Preload every slide image and detect broken ones (works even before hydration)
  useEffect(() => {
    slides.forEach((s, i) => {
      const img = new window.Image();
      img.onerror = () => markFailed(i);
      img.src = s.image;
    });
  }, [markFailed]);

  // Move to the next/previous slide that actually has a working image
  const go = useCallback(
    (dir: 1 | -1) => {
      setActive((current) => {
        let next = current;
        for (let k = 0; k < slides.length; k++) {
          next = (next + dir + slides.length) % slides.length;
          if (!failed.includes(next)) return next;
        }
        return current;
      });
    },
    [failed]
  );

  // If the current slide's image turns out to be broken, move on
  useEffect(() => {
    if (failed.includes(active)) go(1);
  }, [failed, active, go]);

  // Auto slide
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => go(1), SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [active, playing, go]);

  const slide = slides[active];

  return (
    <section
      className={`${bricolage.variable} relative isolate h-[calc(100svh-6.25rem)] min-h-[520px] max-h-[860px] w-full overflow-hidden bg-[#210309] font-[family-name:var(--font-hero)] text-white`}
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null) return;
        const diff = e.changedTouches[0].clientX - touchStart;
        if (Math.abs(diff) > 50) go(diff < 0 ? 1 : -1);
        setTouchStart(null);
      }}
    >
      <style>{`
        @keyframes heroZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes heroUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .hero-zoom { animation: heroZoom 9s ease-out forwards; }
        .hero-up { opacity: 0; animation: heroUp 0.8s cubic-bezier(.2,.7,.2,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .hero-zoom, .hero-up { animation: none; }
          .hero-up { opacity: 1; }
        }
      `}</style>

      {/* Background slides */}
      {slides.map((s, i) => (
        <div
          key={s.image}
          aria-hidden={i !== active}
          className={`absolute inset-0 -z-20 transition-opacity duration-[1200ms] ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.image}
            alt=""
            className={`h-full w-full object-cover object-[center_30%] ${
              i === active ? "hero-zoom" : ""
            }`}
          />
        </div>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#210309]/95 via-[#380712]/75 to-[#380712]/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#210309]/70 via-transparent to-[#210309]/20" />

      {/* Content */}
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-1 items-center px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:pb-16">
        <div key={active} className="max-w-2xl">
          <div className="hero-up mb-4 flex items-center gap-3 sm:mb-6">
            <span className="h-px w-10 bg-[#D4AF69]" />
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#E6C47A] sm:text-xs">
              {slide.eyebrow}
            </p>
          </div>

          <h1
            className="hero-up text-[clamp(2.3rem,5.4vw,4.9rem)] font-semibold leading-[1.04] tracking-[-0.035em]"
            style={{ animationDelay: "0.1s" }}
          >
            {slide.title}{" "}
            <span className="text-[#E6C47A]">{slide.accent}</span>
            <br />
            <span className="font-light text-white/90">{slide.tail}</span>
          </h1>

          <p
            className="hero-up mt-5 max-w-md text-sm font-light leading-7 text-white/80 sm:mt-6 sm:text-base"
            style={{ animationDelay: "0.2s" }}
          >
            {slide.copy}
          </p>

          {/* Buttons */}
          <div
            className="hero-up mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href={slide.href}
              className="group relative inline-flex h-12 items-center gap-4 overflow-hidden rounded-full bg-gradient-to-r from-[#E6C47A] via-[#D4AF69] to-[#B8893F] py-1.5 pl-6 pr-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#380712] shadow-[0_10px_30px_rgba(212,175,105,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(212,175,105,0.5)] active:translate-y-0 sm:h-14 sm:pl-8"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/40 opacity-0 blur-[2px] transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
              />
              <span className="relative">{slide.cta}</span>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#380712] text-[#E6C47A] transition-transform duration-300 group-hover:rotate-[-45deg] sm:h-11 sm:w-11">
                <ArrowRight size={16} strokeWidth={2} />
              </span>
            </Link>

            <Link
              href="/about"
              className="group relative inline-flex h-12 items-center overflow-hidden rounded-full border border-white/40 bg-white/5 px-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-all duration-300 hover:border-[#E6C47A] hover:bg-white/10 hover:text-[#E6C47A] sm:h-14 sm:px-8"
            >
              <span className="relative">
                Our Story
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-px w-0 bg-[#E6C47A] transition-all duration-300 group-hover:w-full"
                />
              </span>
            </Link>
          </div>
        </div>

        {/* Arch image (desktop) */}
        <div className="relative hidden h-full lg:block">
          <div className="absolute right-[6%] top-1/2 aspect-[3/4] h-[78%] -translate-y-1/2">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-[999px] border border-[#D4AF69]/60" />

            <div className="relative h-full w-full overflow-hidden rounded-t-[999px] bg-[#380712] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              {slides.map((s, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={s.image}
                  src={s.image}
                  alt={i === active ? s.caption : ""}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#210309]/50 via-transparent to-transparent" />
            </div>

            <div className="absolute -left-10 bottom-10 border border-[#D4AF69]/40 bg-[#210309]/85 px-5 py-3 backdrop-blur-sm">
              <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-[#D4AF69]">
                Featured
              </p>
              <p
                key={active}
                className="hero-up mt-1 text-xl font-medium tracking-[-0.02em]"
              >
                {slide.caption}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-[1440px] items-center justify-end gap-2 px-5 pb-5 sm:px-8 sm:pb-7 lg:px-12">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-[#D4AF69] hover:text-[#D4AF69]"
          >
            {playing ? (
              <Pause size={15} strokeWidth={1.75} />
            ) : (
              <Play size={15} strokeWidth={1.75} />
            )}
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-[#D4AF69] hover:text-[#D4AF69]"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-[#D4AF69] hover:text-[#D4AF69]"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D4AF69]/70 to-transparent" />
    </section>
  );
}