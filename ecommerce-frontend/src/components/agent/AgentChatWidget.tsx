"use client";

import { useEffect, useRef, useState } from "react";
import AgentChatLauncher from "@/components/agent/AgentChatLauncher";
import AgentChatPanel from "@/components/agent/AgentChatPanel";
import { useAuth } from "@/context/AuthContext";

export default function AgentChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    } else if (wasOpenRef.current) {
      launcherRef.current?.focus();
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <AgentChatLauncher
        isOpen={isOpen}
        onToggle={() => setIsOpen((open) => !open)}
        buttonRef={launcherRef}
      />
      <AgentChatPanel
        isOpen={isOpen}
        userName={user?.name}
        onClose={() => setIsOpen(false)}
        closeButtonRef={closeButtonRef}
      />
    </>
  );
}
