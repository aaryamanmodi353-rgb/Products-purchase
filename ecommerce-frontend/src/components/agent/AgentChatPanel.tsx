"use client";

import Link from "next/link";
import { ArrowRight, Headphones, X } from "lucide-react";
import type { RefObject } from "react";

type AgentChatPanelProps = {
  isOpen: boolean;
  userName?: string;
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
};

export default function AgentChatPanel({
  isOpen,
  userName,
  onClose,
  closeButtonRef,
}: AgentChatPanelProps) {
  return (
    <section
      id="technova-agent-chat-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="technova-agent-chat-title"
      aria-describedby="technova-agent-chat-description"
      hidden={!isOpen}
      className={`fixed bottom-20 right-4 z-[60] ${
        isOpen ? "flex" : ""
      } max-h-[min(34rem,calc(100dvh-6rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-950/20 dark:border-gray-700 dark:bg-gray-900`}
    >
      <header className="flex items-center justify-between border-b border-gray-100 bg-indigo-50 px-4 py-3 dark:border-gray-800 dark:bg-indigo-950/50">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Headphones aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="technova-agent-chat-title" className="truncate text-sm font-semibold text-gray-950 dark:text-white">
              TechNova Support
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">Orders, returns, and store policies</p>
          </div>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close support panel"
          className="ml-2 rounded-lg p-2 text-gray-500 transition hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      <div
        id="technova-agent-chat-description"
        aria-live="polite"
        className="overflow-y-auto p-5"
      >
        {userName ? (
          <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm leading-6 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
            Hi {userName}. I can help with order status, returns, and TechNova store policies.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">
              Sign in to get help with your orders and returns.
            </p>
            <Link
              href="/login"
              onClick={onClose}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-800"
            >
              Sign in to continue
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
