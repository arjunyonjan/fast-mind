"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(prev => !prev);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  const toggle = () => {
    const e = new CustomEvent("toggle-sidebar");
    window.dispatchEvent(e);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="sm:hidden fixed top-3 left-3 z-[60] p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-700/60 shadow-lg shadow-black/5 active:scale-95 transition-all duration-200"
    >
      <div className="relative w-[18px] h-[18px]">
        <Menu
          size={18}
          className="absolute inset-0 text-zinc-600 dark:text-zinc-300 transition-all duration-200"
          style={{
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? "scale(0.5) rotate(-90deg)" : "scale(1) rotate(0deg)",
          }}
        />
        <X
          size={18}
          className="absolute inset-0 text-zinc-600 dark:text-zinc-300 transition-all duration-200"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(90deg)",
          }}
        />
      </div>
    </button>
  );
}
