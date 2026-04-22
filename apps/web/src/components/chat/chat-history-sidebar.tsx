"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  MessageSquareTextIcon,
  MoonStarIcon,
  PlusIcon,
  Search,
  SunIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { Conversation } from "@/features/mock-domain/types";

type HistorySection =
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "Last Month"
  | "All Time";

type ChatHistorySidebarProps = {
  conversations?: Conversation[];
  activeConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onStartNewConversation?: () => void;
};

const HISTORY_SECTIONS: readonly HistorySection[] = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last Month",
  "All Time",
];

const THEME_KEY = "nomi-theme";

function applyTheme(mode: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");

  const storage = window.localStorage;
  if (storage && typeof storage.setItem === "function") {
    storage.setItem(THEME_KEY, mode);
  }
}

type ChatHistoryItem = {
  id: string;
  title: string;
  updatedAt: string;
};

function buildMockHistory(referenceDate: Date): ChatHistoryItem[] {
  const base = referenceDate.getTime();

  return [
    {
      id: "chat-today-1",
      title: "Operator baseline",
      updatedAt: new Date(base - 35 * 60_000).toISOString(),
    },
    {
      id: "chat-yesterday-1",
      title: "Prompt tuning notes",
      updatedAt: new Date(
        base - 1 * 24 * 60 * 60_000 - 50 * 60_000,
      ).toISOString(),
    },
    {
      id: "chat-week-1",
      title: "Incident timeline recap",
      updatedAt: new Date(base - 3 * 24 * 60 * 60_000).toISOString(),
    },
  ];
}

function resolveHistorySection(
  itemDate: Date,
  referenceDate: Date,
): HistorySection {
  const startOfToday = new Date(referenceDate);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfLast7Days = new Date(startOfToday);
  startOfLast7Days.setDate(startOfLast7Days.getDate() - 7);

  const startOfLastMonth = new Date(startOfToday);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

  if (itemDate >= startOfToday) {
    return "Today";
  }

  if (itemDate >= startOfYesterday) {
    return "Yesterday";
  }

  if (itemDate >= startOfLast7Days) {
    return "Last 7 Days";
  }

  if (itemDate >= startOfLastMonth) {
    return "Last Month";
  }

  return "All Time";
}

function groupHistoryBySection(
  history: ChatHistoryItem[],
  referenceDate: Date,
): Record<HistorySection, ChatHistoryItem[]> {
  const grouped = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    "Last Month": [],
    "All Time": [],
  } as Record<HistorySection, ChatHistoryItem[]>;

  history.forEach((item) => {
    const section = resolveHistorySection(
      new Date(item.updatedAt),
      referenceDate,
    );
    grouped[section].push(item);
  });

  return grouped;
}

export function ChatHistorySidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onStartNewConversation,
}: ChatHistorySidebarProps) {
  const referenceDate = useMemo(() => new Date(), []);
  const staticHistory = useMemo(
    () => buildMockHistory(referenceDate),
    [referenceDate],
  );
  const dynamicHistory =
    conversations?.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt,
    })) ?? staticHistory;

  const groupedHistory = useMemo(
    () => groupHistoryBySection(dynamicHistory, referenceDate),
    [dynamicHistory, referenceDate],
  );

  const [fallbackActiveConversationId, setFallbackActiveConversationId] =
    useState<string | null>(dynamicHistory[0]?.id ?? null);
  const [commandOpen, setCommandOpen] = useState(false);
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

  const selectedConversationId =
    activeConversationId ?? fallbackActiveConversationId;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function navigateTo(path: string) {
    if (typeof window !== "undefined") {
      window.location.assign(path);
    }
  }

  function handleThemeToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="gap-2 p-2.5">
          <div className="grid grid-cols-3 gap-2">
            <Button
              asChild
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Link href="/station/dashboard" aria-label="Back to Station">
                <ArrowLeftIcon />
                Back
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-0.5"
              onClick={() => setCommandOpen(true)}
              aria-label="Open command menu"
            >
              <Search />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon /> : <MoonStarIcon />}
            </Button>
          </div>
        </SidebarHeader>

        <SidebarSeparator className="m-0" />

        <SidebarContent className="p-2">
          <Button type="button" onClick={onStartNewConversation}>
            <PlusIcon />
            New chat
          </Button>
          {HISTORY_SECTIONS.map((section) => (
            <SidebarGroup key={section} className="p-0">
              <SidebarGroupLabel>{section}</SidebarGroupLabel>
              <SidebarGroupContent>
                {groupedHistory[section].length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-sidebar-foreground/70">
                    No chats yet.
                  </p>
                ) : (
                  <SidebarMenu className="gap-1">
                    {groupedHistory[section].map((item) => {
                      const isActive = item.id === selectedConversationId;

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.title}
                            onClick={() => {
                              if (onSelectConversation) {
                                onSelectConversation(item.id);
                                return;
                              }

                              setFallbackActiveConversationId(item.id);
                            }}
                          >
                            <MessageSquareTextIcon />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Run a command..." />
        <CommandList>
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Chat">
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                onStartNewConversation?.();
              }}
            >
              <PlusIcon />
              New chat
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                navigateTo("/station/dashboard");
              }}
            >
              Back to Station
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                navigateTo("/station/events");
              }}
            >
              Open events
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                navigateTo("/station/memories");
              }}
            >
              Open memories
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
