"use client";

import { MessageCircle, X } from "lucide-react";
import type { RefObject } from "react";

type AgentChatLauncherProps = {
  isOpen: boolean;
  onToggle: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
};

export default function AgentChatLauncher({
  isOpen,
  onToggle,
  buttonRef,
}: AgentChatLauncherProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? "Close TechNova support" : "Open TechNova support"}
      aria-expanded={isOpen}
      aria-controls="technova-agent-chat-panel"
      className="fixed bottom-4 right-4 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-800"
    >
      {isOpen ? <X aria-hidden="true" className="h-6 w-6" /> : <MessageCircle aria-hidden="true" className="h-6 w-6" />}
    </button>
  );
}
