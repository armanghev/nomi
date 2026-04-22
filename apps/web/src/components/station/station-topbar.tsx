"use client";

import { useEffect, useState } from "react";
import { CommandIcon, MoonStarIcon, SearchIcon, SunIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const THEME_KEY = "nomi-theme";

function applyTheme(mode: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");

  const storage = window.localStorage;
  if (storage && typeof storage.setItem === "function") {
    storage.setItem(THEME_KEY, mode);
  }
}

export function StationTopbar() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storage = window.localStorage;
    const saved =
      storage && typeof storage.getItem === "function"
        ? storage.getItem(THEME_KEY)
        : null;

    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function handleThemeToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <header className="z-30 shrink-0 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <label className="relative block w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search station"
            placeholder="Search station"
            className="h-9 pl-9"
          />
        </label>

        <Button type="button" variant="outline" size="sm" className="gap-2">
          <CommandIcon className="size-4" />
          Command
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunIcon className="size-4" />
          ) : (
            <MoonStarIcon className="size-4" />
          )}
        </Button>

        <div className="ml-1 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-2 py-1 text-xs">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-700" />
            <span className="relative inline-flex size-2 rounded-full bg-green-600" />
          </span>
          System healthy
        </div>
      </div>
    </header>
  );
}
