"use client";

import {
  Moon,
  Sun,
  ShoppingCart,
  User,
  Shield,
  Package,
  LogOut,
  PackagePlus,
  ChevronDown,
  UserCircle,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d9dfd2] bg-[#f6f4eb]/95 backdrop-blur-xl dark:border-[#36473b] dark:bg-[#19261e]/95">
      <div className="bg-[#173326] px-4 py-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-[#e8eddf] sm:text-[10px]">
        A thoughtfully curated destination for modern tech
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.1rem] items-center justify-between sm:h-[4.5rem]">
          <Link
            href="/"
            aria-label="TechNova home"
            className="flex items-center gap-2.5 text-[#213b2d] dark:text-[#f6f3e9]"
          >
            <Image
              src="/technova-mark.svg"
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
              className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
            />
            <span className="font-editorial text-[1.75rem] font-semibold leading-none tracking-[-0.045em] sm:text-[2rem]">
              TechNova<span className="text-[#63816a] dark:text-[#b7c8aa]">.</span>
            </span>
          </Link>

          <nav className="hidden md:block" aria-label="Main navigation">
            <ul className="flex items-center gap-7 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#536056] lg:gap-9">
              <li><Link href="/" className="transition-colors hover:text-[#244c37] dark:text-[#d0d8cd] dark:hover:text-white">Shop</Link></li>
              <li><Link href="/#collections" className="transition-colors hover:text-[#244c37] dark:text-[#d0d8cd] dark:hover:text-white">Collections</Link></li>
              <li><Link href="/#catalog-products" className="transition-colors hover:text-[#244c37] dark:text-[#d0d8cd] dark:hover:text-white">New arrivals</Link></li>
              {user && (
                <>
                  <li><Link href="/sell" className="flex items-center gap-1 transition-colors hover:text-[#244c37] dark:text-[#d0d8cd] dark:hover:text-white"><PackagePlus className="h-4 w-4" /> Sell</Link></li>
                  <li><Link href="/orders" className="flex items-center gap-1 transition-colors hover:text-[#244c37] dark:text-[#d0d8cd] dark:hover:text-white"><Package className="h-4 w-4" /> Orders</Link></li>
                </>
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#425448] transition hover:bg-[#e8ecdf] hover:text-[#1f4833] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63816a] dark:text-[#e0e6dc] dark:hover:bg-[#293a2e] dark:hover:text-white"
                aria-label="Toggle Dark Mode"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            <Link
              href="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#344c3c] transition hover:bg-[#e8ecdf] hover:text-[#1f4833] dark:text-[#e0e6dc] dark:hover:bg-[#293a2e] dark:hover:text-white"
              aria-label={"Cart" + (totalItems > 0 ? ", " + totalItems + " items" : "")}
              title="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute right-0 top-0 inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#315b43] px-1 text-[9px] font-bold leading-none text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  className="ml-1 flex h-10 items-center gap-2 rounded-full border border-[#cdd5c8] px-3 text-sm font-medium text-[#34493a] transition hover:border-[#66836b] hover:bg-[#eef0e7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63816a] dark:border-[#46594a] dark:text-[#f1f0e7] dark:hover:border-[#8ba48a] dark:hover:bg-[#293a2e]"
                >
                  <UserCircle className="h-5 w-5 text-[#829084]" />
                  <span className="hidden max-w-[100px] truncate sm:inline">{user.name}</span>
                  <ChevronDown className={"h-4 w-4 text-[#829084] transition-transform " + (dropdownOpen ? "rotate-180" : "")} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-[#dce1d7] bg-[#fbfaf5] shadow-xl dark:border-[#3b4b3d] dark:bg-[#202e25]">
                    <div className="border-b border-[#e7e9df] px-4 py-3 dark:border-[#36463a]">
                      <p className="text-sm font-semibold text-[#213b2d] dark:text-white">{user.name}</p>
                      <p className="mt-0.5 text-xs text-[#728075] dark:text-[#b2bcae]">{user.role === "ADMIN" ? "Administrator" : "Member"}</p>
                    </div>

                    <div className="py-1">
                      <Link href="/sell" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#435348] transition hover:bg-[#eff1e8] dark:text-[#e0e6dc] dark:hover:bg-[#2a392f]">
                        <PackagePlus className="h-4 w-4 text-[#819084]" /> Sell a Product
                      </Link>
                      <Link href="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#435348] transition hover:bg-[#eff1e8] dark:text-[#e0e6dc] dark:hover:bg-[#2a392f]">
                        <Package className="h-4 w-4 text-[#819084]" /> My Orders
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#435348] transition hover:bg-[#eff1e8] dark:text-[#e0e6dc] dark:hover:bg-[#2a392f]">
                          <Shield className="h-4 w-4 text-[#819084]" /> Admin Dashboard
                        </Link>
                      )}

                      <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#435348] transition hover:bg-[#eff1e8] dark:text-[#e0e6dc] dark:hover:bg-[#2a392f]">
                        <Settings className="h-4 w-4 text-[#819084]" /> Profile Settings
                      </Link>
                    </div>

                    <div className="border-t border-[#e7e9df] py-1 dark:border-[#36463a]">
                      <button onClick={() => { setDropdownOpen(false); logout(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-700 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="ml-1 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#315b43] px-4 text-xs font-semibold text-white transition hover:bg-[#244a35] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c5d1b6] dark:bg-[#d9e3d0] dark:text-[#1e392a] dark:hover:bg-white sm:px-5 sm:text-sm">
                <User className="h-4 w-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
