"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivityIcon,
  BotIcon,
  CableIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  PocketKnifeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stationItems = [
  { href: "/station/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/station/agents", label: "Agents", icon: BotIcon },
  { href: "/station/memories", label: "Memories", icon: PocketKnifeIcon },
  { href: "/station/connections", label: "Connections", icon: CableIcon },
  { href: "/station/tokens", label: "Tokens", icon: KeyRoundIcon },
  { href: "/station/events", label: "Events", icon: ActivityIcon },
] as const;

export function StationSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen border-r border-border/70 bg-sidebar/90 px-3 py-4 lg:flex lg:flex-col">
      <div className="mb-6 rounded-xl border border-border/75 bg-background/70 px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Nomi
        </p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">Station</h1>
      </div>

      <nav className="space-y-1">
        {stationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border/70 pt-4">
        <Link
          href="/chat"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith("/chat")
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          )}
        >
          <MessageSquareTextIcon className="size-4" />
          <span>Chat</span>
        </Link>
      </div>
    </aside>
  );
}
