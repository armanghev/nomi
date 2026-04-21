"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  ActivityIcon,
  BotIcon,
  CableIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  PocketKnifeIcon,
} from "lucide-react";
import { Logo } from "@/components/sidebar-03/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/sidebar-03/nav-main";
import { NotificationsPopover } from "@/components/sidebar-03/nav-notifications";
import { TeamSwitcher } from "@/components/sidebar-03/team-switcher";

const stationRoutes: Route[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboardIcon className="size-4" />,
    link: "/station/dashboard",
  },
  {
    id: "agents",
    title: "Agents",
    icon: <BotIcon className="size-4" />,
    link: "/station/agents",
  },
  {
    id: "memories",
    title: "Memories",
    icon: <PocketKnifeIcon className="size-4" />,
    link: "/station/memories",
  },
  {
    id: "connections",
    title: "Connections",
    icon: <CableIcon className="size-4" />,
    link: "/station/connections",
  },
  {
    id: "tokens",
    title: "Tokens",
    icon: <KeyRoundIcon className="size-4" />,
    link: "/station/tokens",
  },
  {
    id: "events",
    title: "Events",
    icon: <ActivityIcon className="size-4" />,
    link: "/station/events",
  },
  {
    id: "chat",
    title: "Chat",
    icon: <MessageSquareTextIcon className="size-4" />,
    link: "/chat",
  },
];

const stationNotifications = [
  {
    id: "1",
    avatar: "",
    fallback: "EV",
    text: "New token usage spike detected.",
    time: "4m ago",
  },
  {
    id: "2",
    avatar: "",
    fallback: "AG",
    text: "Agent retry completed successfully.",
    time: "12m ago",
  },
  {
    id: "3",
    avatar: "",
    fallback: "GH",
    text: "GitHub connection entered degraded state.",
    time: "28m ago",
  },
];

const environments = [
  { id: "local", name: "Local Dev", logo: Logo, plan: "Mock" },
  { id: "preview", name: "Preview", logo: Logo, plan: "Mock" },
  { id: "prod", name: "Production", logo: Logo, plan: "Mock" },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <Link href="/station/dashboard" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          {!isCollapsed && (
            <span className="font-semibold text-black dark:text-white">
              Nomi Station
            </span>
          )}
        </Link>

        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
        >
          <NotificationsPopover notifications={stationNotifications} />
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={stationRoutes} />
      </SidebarContent>

      <SidebarFooter className="px-2">
        <TeamSwitcher teams={environments} />
      </SidebarFooter>
    </Sidebar>
  );
}
