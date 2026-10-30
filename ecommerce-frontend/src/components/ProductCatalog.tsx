"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
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
    matches: /headphones?|audio|speaker|earbuds?/i,
  },
  {
    name: "Gaming",
    note: "Play without limits",
    matches: /gaming|keyboard|controller|console|mouse/i,
  },
  {
    name: "Displays",
    note: "A clearer view",
    matches: /monitor|display|screen/i,
  },
  {
    name: "Wearables",
    note: "Technology in motion",
    matches: /watch|wearable|fitness/i,
  },
];

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

          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 sm:gap-x-8">
            {featuredCategories.map((category) => (
                <Link
                  key={category.name}
                  href={"/products/" + category.product.id}
                  className="group flex flex-col items-center text-center"
                >
                  <span className="relative mb-4 aspect-[1.18] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 transition duration-500 group-hover:-translate-y-1 group-hover:border-indigo-300 group-hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <img
                      src={category.product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="font-editorial text-lg text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                  <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
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
              {featuredCategories.map((category, index) => (
                <div key={category.name} className="w-full shrink-0 snap-start px-0.5 pb-3">
                  <Link
                    href={"/products/" + category.product.id}
                    className="group grid min-h-[22rem] overflow-hidden rounded-2xl border border-[#cbd4c7] bg-[#20372c] shadow-[0_20px_52px_-32px_rgba(25,45,33,0.65)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-32px_rgba(25,45,33,0.72)] sm:min-h-[26rem] lg:grid-cols-[1.32fr_0.82fr]"
                  >
                    <div className="relative min-h-64 overflow-hidden bg-[#e9e6d7] sm:min-h-80 lg:min-h-[27rem]">
                      <img
                        src={category.product.imageUrl}
                        alt={category.product.name}
                        className="absolute inset-0 h-full w-full object-cover brightness-[0.94] contrast-[0.96] saturate-[0.72] transition-transform duration-1000 ease-out group-hover:scale-[1.035]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-tr from-[#20372c]/30 via-[#20372c]/5 to-transparent mix-blend-multiply" aria-hidden="true" />
                      <span className="absolute left-5 top-5 rounded-full border border-white/70 bg-[#f5f4ed]/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#244c37] shadow-sm backdrop-blur-sm sm:left-7 sm:top-7">
                        {category.name}
                      </span>
                      <span className="absolute bottom-5 right-5 rounded-full border border-white/70 bg-black/15 px-3 py-1.5 text-[10px] font-medium tracking-[0.12em] text-white backdrop-blur-sm sm:bottom-7 sm:right-7">
                        {String(index + 1).padStart(2, "0")} / {String(featuredCategories.length).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="relative flex flex-col justify-between p-6 sm:p-9 lg:p-12">
                      <div>
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b7c4b4]">
                          {category.name} · Featured collection
                        </p>
                        <h3 className="max-w-[13ch] font-editorial text-3xl leading-[1.02] text-[#f3f0e5] sm:text-4xl lg:text-[2.8rem]">
                          {category.product.name}
                        </h3>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-[#c6d0c3] sm:text-base">
                          {category.note}. Explore {category.productCount} thoughtfully selected {category.productCount === 1 ? "piece" : "pieces"} from the TechNova collection.
                        </p>
                      </div>
                      <div className="mt-8 flex items-center justify-between border-t border-white/20 pt-5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#d0d8cc]">
                          Explore collection
                        </span>
                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#829581] text-[#e5eadf] transition duration-500 group-hover:rotate-45 group-hover:border-[#e5eadf] group-hover:bg-[#e5eadf] group-hover:text-[#20372c]">
                          <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
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
