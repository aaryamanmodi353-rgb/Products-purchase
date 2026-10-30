import Image from "next/image";
import ProductCatalog from "@/components/ProductCatalog";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section
        aria-labelledby="home-title"
        className="relative isolate min-h-[610px] overflow-hidden bg-[#14271e] text-[#f8f5ea] sm:min-h-[650px] lg:min-h-[690px]"
      >
        <Image
          src="/technova-home-studio-hero.png"
          alt="Forest-green wireless headphones displayed in a warmly lit modern listening space"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[62%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12251c] via-[#12251c]/90 to-[#12251c]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12251c]/70 via-transparent to-[#12251c]/15" />

        <div className="relative mx-auto flex min-h-[610px] max-w-7xl flex-col justify-center px-5 pb-14 pt-16 sm:min-h-[650px] sm:px-8 lg:min-h-[690px] lg:px-10">
          <div className="max-w-[42rem]">
            <p className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9dfd2] sm:text-xs">
              <span className="h-px w-8 bg-[#b8c6a8]" />
              TechNova · Curated technology
            </p>

            <h1
              id="home-title"
              aria-label="Next-Gen Tech. Delivered Tomorrow."
              className="font-editorial max-w-[11ch] text-balance text-[clamp(3.5rem,7vw,6.6rem)] leading-[0.9] tracking-[-0.055em] text-[#fffdf6]"
            >
              <span className="block">
                <span className="whitespace-nowrap">
                  Next<span className="font-sans relative -top-[0.04em] text-[0.86em] font-light tracking-normal">-</span>Gen
                </span>{" "}Tech.
              </span>
              <span className="mt-2 block text-[#c5d1b6]">
                <span className="font-script block text-[1.06em] font-medium leading-[0.84] tracking-normal">
                  Delivered
                </span>
                <span className="font-script mt-1 block text-[1.06em] font-medium leading-[0.84] tracking-normal">
                  Tomorrow.
                </span>
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-[#e1e4da] sm:text-base">
              Discover the latest in premium electronics, gaming gear, and smart
              home devices. Curated for enthusiasts.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#catalog-products"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e8edda] px-6 text-sm font-semibold text-[#203d2d] shadow-lg shadow-black/10 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c5d1b6]/50"
              >
                Shop now
                <span aria-hidden="true">↗</span>
              </a>
              <a
                href="#collections"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/45 px-6 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Explore collections
              </a>
            </div>
          </div>

          <div className="mt-12 flex max-w-2xl flex-wrap gap-x-7 gap-y-3 border-t border-white/25 pt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#e0e5d8] sm:gap-x-9 sm:text-[10px]">
            <a href="#collections" className="transition hover:text-white">
              Audio
            </a>
            <a href="#collections" className="transition hover:text-white">
              Gaming
            </a>
            <a href="#collections" className="transition hover:text-white">
              Displays
            </a>
            <a href="#collections" className="transition hover:text-white">
              Smart living
            </a>
          </div>
        </div>
      </section>

      <div id="catalog" className="scroll-mt-28">
        <ProductCatalog />
      </div>
    </main>
  );
}
