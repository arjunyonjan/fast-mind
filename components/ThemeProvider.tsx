"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "tron";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme | null;
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefers ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark"); document.documentElement.classList.toggle("tron", initial === "tron");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : theme === "light" ? "tron" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark"); document.documentElement.classList.toggle("tron", next === "tron");
  };

  if (!mounted) return <>{children}</>;

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}