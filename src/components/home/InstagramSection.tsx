"use client";

import Link from "next/link";
import { useState } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Instagram } from "@/components/common/BrandIcons";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-insta",
  display: "swap",
});

const instagramUrl = "https://www.instagram.com/mydhilicollections2010/";
const handle = "@mydhilicollections2010";

const instagramImages = [
  {
    src: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
    alt: "Elegant Indian ethnic fashion",
    label: "Timeless elegance",
  },
  {
    src: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85",
    alt: "Traditional Indian outfit",
    label: "Everyday tradition",
  },
  {
    src: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
    alt: "Contemporary ethnic clothing",
    label: "Modern classics",
  },
  {
    src: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
    alt: "Indian fashion collection",
    label: "Made to be admired",
  },
];

export default function InstagramSection() {
  const [broken, setBroken] = useState<string[]>([]);

  return (
    <section
      className={`${bricolage.variable} overflow-hidden bg-[#FAF7F2] px-5 py-8 font-[family-name:var(--font-insta)] sm:px-8 sm:py-10 lg:px-10 lg:py-14`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-6 flex flex-col justify-between gap-5 md:mb-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#A27B35]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#946C2D] sm:text-xs">
                A world of inspiration
              </p>
            </div>

            <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-[#380712]">
              Style worth <span className="text-[#A27B35]">sharing.</span>
            </h2>

            <p className="mt-4 max-w-lg text-sm font-light leading-7 text-stone-600 sm:text-base">
              From timeless traditions to fresh expressions of style, discover
              a little inspiration for every beautiful moment with Mydhili
              Collections.
            </p>
          </div>

          <Link
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-fit items-center gap-3 rounded-full border border-[#380712]/20 py-2 pl-2 pr-5 text-sm font-medium text-[#380712] transition-all duration-300 hover:border-[#380712] hover:bg-[#380712] hover:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#380712] text-[#E6C47A] transition-colors duration-300 group-hover:bg-[#D4AF69] group-hover:text-[#380712]">
              <Instagram size={19} />
            </span>
            <span>{handle}</span>
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {instagramImages.map((image, index) => {
            const isBroken = broken.includes(image.src);

            return (
              <Link
                key={image.src}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Mydhili Collections on Instagram: ${image.alt}`}
                className={`group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-[#380712] to-[#6D2636] shadow-[0_10px_30px_rgba(56,7,18,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(56,7,18,0.22)] ${
                  index % 2 === 1 ? "lg:mt-10" : "lg:mb-10"
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {!isBroken && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      onError={() =>
                        setBroken((prev) => [...prev, image.src])
                      }
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                    />
                  )}
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#25030A]/80 via-transparent to-[#25030A]/15" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 transition-all duration-500 group-hover:ring-[#D4AF69]/60" />

                {/* Top: instagram chip */}
                <div className="absolute inset-x-0 top-0 flex justify-end p-3.5 sm:p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors duration-300 group-hover:border-[#E6C47A] group-hover:bg-[#D4AF69] group-hover:text-[#380712]">
                    <Instagram size={18} />
                  </span>
                </div>

                {/* Bottom: label */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                  <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-[#E6C47A] sm:text-[10px]">
                    Mydhili Collections
                  </p>
                  <h3 className="text-lg font-semibold leading-tight tracking-[-0.02em] sm:text-xl">
                    {image.label}
                  </h3>
                  <div className="mt-3 h-px w-8 bg-[#D4AF69] transition-all duration-500 group-hover:w-16" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Follow card */}
        <div className="relative mt-12 overflow-hidden rounded-3xl bg-[#380712] px-6 py-8 text-white shadow-[0_24px_60px_rgba(56,7,18,0.2)] sm:mt-16 sm:px-10 sm:py-9">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#D4AF69]/15 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF69]/60 to-transparent" />

          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#D4AF69]/60 bg-[#210309] text-xl font-semibold text-[#E6C47A]">
                M
              </span>
              <div>
                <p className="text-lg font-semibold tracking-[-0.02em]">
                  {handle}
                </p>
                <p className="mt-0.5 text-sm font-light text-white/65">
                  A little beauty, a little tradition, a lot of you.
                </p>
              </div>
            </div>

            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex h-12 shrink-0 items-center gap-4 overflow-hidden rounded-full bg-gradient-to-r from-[#E6C47A] via-[#D4AF69] to-[#B8893F] py-1.5 pl-7 pr-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#380712] shadow-[0_10px_30px_rgba(212,175,105,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(212,175,105,0.4)] sm:h-14 sm:pl-8"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/40 opacity-0 blur-[2px] transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
              />
              <span className="relative">Follow on Instagram</span>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#380712] text-[#E6C47A] transition-transform duration-300 group-hover:rotate-[-45deg] sm:h-11 sm:w-11">
                <ArrowRight size={16} strokeWidth={2} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}