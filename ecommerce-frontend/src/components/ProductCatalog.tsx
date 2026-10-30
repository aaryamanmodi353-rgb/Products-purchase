"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProductCard from "./ProductCard";
import { API_URL } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
}

const categoryDefinitions = [
  {
    name: "Audio",
    note: "Sound, refined",
    panelTone: "forest",
    matches: /headphones?|audio|speaker|earbuds?/i,
    artworkMatches: /speaker|earbuds?|airpods/i,
  },
  {
    name: "Gaming",
    note: "Play without limits",
    panelTone: "gold",
    matches: /gaming|keyboard|controller|console|mouse/i,
    artworkMatches: /mouse|controller|console/i,
  },
  {
    name: "Displays",
    note: "A clearer view",
    panelTone: "stone",
    matches: /monitor|display|screen/i,
    artworkMatches: /horizon|edge|creator monitor/i,
  },
  {
    name: "Wearables",
    note: "Technology in motion",
    panelTone: "sage",
    matches: /watch|wearable|fitness/i,
    artworkMatches: /activefit|pulseband|fitness tracker/i,
  },
] as const;

const featuredPanelPalettes = {
  forest: {
    background: "#153b30",
    eyebrow: "#b7c9ba",
    title: "#f5f1e6",
    body: "#d0d9cf",
    divider: "rgba(245, 241, 230, 0.2)",
    footer: "#edf0e8",
    arrow: "#8aa092",
  },
  gold: {
    background: "#eeede4",
    eyebrow: "#687367",
    title: "#24372b",
    body: "#586357",
    divider: "rgba(36, 55, 43, 0.18)",
    footer: "#354633",
    arrow: "#8d9a8a",
  },
  stone: {
    background: "#d8d7cc",
    eyebrow: "#626b60",
    title: "#25392e",
    body: "#566257",
    divider: "rgba(37, 57, 46, 0.2)",
    footer: "#3b4c3d",
    arrow: "#718071",
  },
  sage: {
    background: "#afbd9f",
    eyebrow: "#52634f",
    title: "#20382b",
    body: "#465a49",
    divider: "rgba(32, 56, 43, 0.22)",
    footer: "#334934",
    arrow: "#61775e",
  },
} as const;

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);
  const featuredTrackRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(API_URL + "/api/products", {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Product API responded with HTTP " + response.status + ".");
      }

      const data: unknown = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Product API returned an invalid response.");
      }

      setProducts(data as Product[]);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") {
        setError("The product service timed out. Check that the backend is running and try again.");
      } else if (cause instanceof Error && cause.message.startsWith("Product API")) {
        setError(cause.message);
      } else {
        setError("Could not connect to the product service. Check that the backend is running and try again.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleDelete = (id: string) => {
    setProducts((previous) => previous.filter((product) => product.id !== id));
  };

  const featuredCategories = categoryDefinitions.flatMap((category) => {
    const matchingProducts = products.filter((product) =>
      category.matches.test(product.name + " " + product.description),
    );
    const product = matchingProducts[0];

    return product
      ? [{ ...category, product, productCount: matchingProducts.length }]
      : [];
  });

  const shopCategories = featuredCategories.map((category) => {
    const alternateImage = products.find(
      (product) =>
        product.id !== category.product.id &&
        category.artworkMatches.test(product.name + " " + product.description),
    );

    return { ...category, imageProduct: alternateImage ?? category.product };
  });

  const moveFeaturedTo = useCallback((index: number) => {
    const track = featuredTrackRef.current;
    if (!track || featuredCategories.length === 0) return;

    const nextIndex = (index + featuredCategories.length) % featuredCategories.length;
    track.scrollTo({ left: nextIndex * track.clientWidth, behavior: "smooth" });
    setActiveFeaturedIndex(nextIndex);
  }, [featuredCategories.length]);

  useEffect(() => {
    if (featuredCategories.length < 2 || isFeaturedPaused) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      if (document.hidden || document.activeElement?.closest("#collections")) return;
      moveFeaturedTo(activeFeaturedIndex + 1);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [activeFeaturedIndex, featuredCategories.length, isFeaturedPaused, moveFeaturedTo]);

  const syncFeaturedIndex = () => {
    const track = featuredTrackRef.current;
    if (!track) return;
    setActiveFeaturedIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  if (loading) {
    return (
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="mb-8">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              The TechNova edit
            </p>
            <h2 className="font-editorial text-3xl text-gray-900 dark:text-white sm:text-4xl">
              Latest Arrivals
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-surface dark:border-gray-800"
              >
                <div className="aspect-[1.08] bg-gray-100 dark:bg-gray-800" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-10 rounded-full bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="catalog-products"
        className="bg-background px-5 py-16 sm:px-8 lg:px-10"
      >
        <div role="alert" className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-surface px-6 py-12 text-center dark:border-gray-800 sm:px-10">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            The TechNova edit
          </p>
          <h2 className="font-editorial text-3xl text-gray-900 dark:text-white">
            The collection is taking a moment
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void fetchProducts()}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:focus-visible:ring-indigo-900"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-background">
      {featuredCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-8 sm:pb-16 lg:px-10">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Browse the edit
              </p>
              <h2 className="font-editorial text-3xl text-gray-900 dark:text-white sm:text-4xl">
                Shop by category
              </h2>
            </div>
            <span className="hidden pb-1 text-xs text-gray-500 sm:block">
              Thoughtful tech for every day
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-4 sm:gap-x-8">
            {shopCategories.map((category) => (
              <Link
                key={category.name}
                href={"/products/" + category.product.id}
                className="group flex flex-col items-center text-center focus-visible:outline-none"
              >
                <span className="relative mb-5 block aspect-square w-full max-w-[15rem] rounded-full border border-[#d5dbce] bg-[#e9e9df] p-2 shadow-[0_12px_30px_-20px_rgba(31,55,43,0.5)] transition duration-500 group-hover:-translate-y-1 group-hover:border-[#8fa18d] group-hover:shadow-[0_18px_38px_-20px_rgba(31,55,43,0.45)] group-focus-visible:ring-2 group-focus-visible:ring-[#315b43] group-focus-visible:ring-offset-4">
                  <span className="block h-full w-full overflow-hidden rounded-full bg-[#f6f4ea]">
                    <img
                      src={category.imageProduct.imageUrl}
                      alt={category.imageProduct.name}
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    />
                  </span>
                  <span className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#d5dbce] bg-[#f7f5eb] text-[#315b43] shadow-sm transition duration-300 group-hover:border-[#315b43] group-hover:bg-[#315b43] group-hover:text-white">
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>
                <span className="font-editorial text-xl text-[#263b2e] transition-colors group-hover:text-[#315b43] dark:text-white">
                  {category.name}
                </span>
                <span className="mt-1.5 text-xs text-[#738071] dark:text-gray-400">
                  {category.note} · {category.productCount}{" "}
                  {category.productCount === 1 ? "product" : "products"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredCategories.length > 0 && (
        <section
          id="collections"
          onMouseEnter={() => setIsFeaturedPaused(true)}
          onMouseLeave={() => setIsFeaturedPaused(false)}
          onFocusCapture={() => setIsFeaturedPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsFeaturedPaused(false);
            }
          }}
          className="scroll-mt-32 border-y border-[#d9ddcf] bg-gradient-to-br from-[#e9e9dd] via-[#f2f1e8] to-[#e5e7dc] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#748174]">
                  Find your next favorite
                </p>
                <h2 className="font-editorial text-3xl text-[#20372c] sm:text-4xl">
                  Featured collections
                </h2>
              </div>
              <div className="mb-1 flex items-center gap-3">
                <span className="hidden text-xs tabular-nums tracking-[0.12em] text-[#748174] sm:inline" aria-live="polite">
                  {String(activeFeaturedIndex + 1).padStart(2, "0")} / {String(featuredCategories.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => moveFeaturedTo(activeFeaturedIndex - 1)}
                  aria-label="Show previous featured collection"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c7d0c3] text-[#315b43] transition hover:border-[#315b43] hover:bg-[#315b43] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315b43] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2f1e8]"
                >
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveFeaturedTo(activeFeaturedIndex + 1)}
                  aria-label="Show next featured collection"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c7d0c3] text-[#315b43] transition hover:border-[#315b43] hover:bg-[#315b43] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315b43] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2f1e8]"
                >
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
                <a
                  href="#catalog-products"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#445448] transition hover:text-[#315b43]"
                >
                  View all
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div
              ref={featuredTrackRef}
              onScroll={syncFeaturedIndex}
              aria-label="Featured product collections"
              className="featured-carousel-track flex snap-x snap-mandatory overflow-x-auto rounded-2xl"
            >
              {featuredCategories.map((category, index) => {
                const palette = featuredPanelPalettes[category.panelTone];

                return (
                  <div key={category.name} className="w-full shrink-0 snap-start px-0.5 pb-3">
                  <Link
                    href={"/products/" + category.product.id}
                    style={{ backgroundColor: palette.background }}
                    className="group grid min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-[#cbd4c7] shadow-[0_22px_58px_-34px_rgba(17,45,34,0.62)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_30px_68px_-34px_rgba(17,45,34,0.68)] sm:min-h-[26rem] lg:min-h-[40rem] xl:min-h-[42rem] lg:grid-cols-[1.62fr_1fr]"
                  >
                    <div className="relative min-h-64 overflow-hidden bg-[#e9e6d7] sm:min-h-80 lg:min-h-[40rem] xl:min-h-[42rem]">
                      <img
                        src={category.product.imageUrl}
                        alt={category.product.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
                      />
                      <span className="absolute left-6 top-6 rounded-full border border-white/70 bg-[#f5f4ed]/90 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#244c37] shadow-sm backdrop-blur-sm sm:left-9 sm:top-9">
                        {category.name}
                      </span>
                      <span className="absolute bottom-6 right-6 rounded-full border border-white/70 bg-[#173d31]/25 px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-white backdrop-blur-sm sm:bottom-9 sm:right-9">
                        {String(index + 1).padStart(2, "0")} / {String(featuredCategories.length).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="relative flex flex-col justify-between p-7 sm:p-10 lg:p-14 xl:p-16">
                      <div>
                        <p style={{ color: palette.eyebrow }} className="mb-7 text-[10px] font-semibold uppercase tracking-[0.22em]">
                          {category.name} · Featured collection
                        </p>
                        <h3 style={{ color: palette.title }} className="max-w-[12ch] font-editorial text-4xl font-semibold leading-[0.94] tracking-[-0.025em] sm:text-5xl lg:text-[3.75rem] xl:text-[4rem]">
                          {category.product.name}
                        </h3>
                        <p style={{ color: palette.body }} className="mt-7 max-w-sm text-sm leading-7 sm:text-base sm:leading-8">
                          {category.name === "Audio"
                            ? `Immersive sound, refined. Discover ${category.productCount} thoughtfully selected ${category.productCount === 1 ? "piece" : "pieces"} made for deep focus and unhurried listening.`
                            : `${category.note}. Discover ${category.productCount} thoughtfully selected ${category.productCount === 1 ? "piece" : "pieces"} from the TechNova collection.`}
                        </p>
                      </div>
                      <div style={{ borderColor: palette.divider }} className="mt-10 flex items-center justify-between border-t pt-7">
                        <span style={{ color: palette.footer }} className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                          Explore collection
                        </span>
                        <span style={{ borderColor: palette.arrow, color: palette.footer }} className="flex h-14 w-14 items-center justify-center rounded-full border transition duration-500 group-hover:translate-x-1 group-hover:border-transparent group-hover:bg-[#24372b] group-hover:text-[#f5f1e6]">
                          <ArrowRight aria-hidden="true" className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section
        id="catalog-products"
        className="mx-auto max-w-7xl scroll-mt-32 px-5 py-16 sm:px-8 sm:py-20 lg:px-10"
      >
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              The latest from TechNova
            </p>
            <h2 className="font-editorial text-3xl text-gray-900 dark:text-white sm:text-4xl">
              Latest Arrivals
            </h2>
          </div>
          <span className="mb-1 hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
            {products.length} curated {products.length === 1 ? "piece" : "pieces"}
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-surface px-6 py-16 text-center dark:border-gray-800">
            <p className="font-editorial text-2xl text-gray-900 dark:text-white">
              New pieces are on their way.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
