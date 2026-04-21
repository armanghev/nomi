"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import {
  IconActivity,
  IconBrain,
  IconLink,
  IconMessageCircle,
  IconRobot,
  IconTicket,
} from "@tabler/icons-react";
import { LayoutDashboard } from "lucide-react";
import { NavCollapsible } from "@/components/sidebar-01/nav-collapsible";
import { NavFooter } from "@/components/sidebar-01/nav-footer";
import { NavHeader } from "@/components/sidebar-01/nav-header";
import { NavMain } from "@/components/sidebar-01/nav-main";
import type { SidebarData } from "./types";

const data: SidebarData = {
  user: {
    name: "Local Dev",
    email: "mock",
    avatar: "",
  },
  navMain: [
    {
      id: "dashboard",
      title: "Dashboard",
      url: "/station/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      id: "agents",
      title: "Agents",
      url: "/station/agents",
      icon: IconRobot,
    },
    {
      id: "memories",
      title: "Memories",
      url: "/station/memories",
      icon: IconBrain,
    },
    {
      id: "connections",
      title: "Connections",
      url: "/station/connections",
      icon: IconLink,
    },
    {
      id: "tokens",
      title: "Tokens",
      url: "/station/tokens",
      icon: IconTicket,
    },
    {
      id: "events",
      title: "Events",
      url: "/station/events",
      icon: IconActivity,
    },
    {
      id: "chat",
      title: "Chat",
      url: "/chat",
      icon: IconMessageCircle,
    },
  ],
  navCollapsible: {
    favorites: [
      {
        id: "local-dev",
        title: "Local Dev",
        href: "#",
        color: "bg-emerald-400 dark:bg-emerald-300",
      },
      {
        id: "preview",
        title: "Preview",
        href: "#",
        color: "bg-blue-400 dark:bg-blue-300",
      },
      {
        id: "production",
        title: "Production",
        href: "#",
        color: "bg-orange-400 dark:bg-orange-300",
      },
    ],
    teams: [
      {
        id: "routing",
        title: "Routing",
        icon: IconLink,
      },
    ],
    topics: [
      {
        id: "token-ops",
        title: "Token Ops",
        icon: IconTicket,
      },
    ],
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <NavHeader data={data} />
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavCollapsible
          favorites={data.navCollapsible.favorites}
          teams={data.navCollapsible.teams}
          topics={data.navCollapsible.topics}
        />
      </SidebarContent>
      <NavFooter user={data.user} />
    </Sidebar>
  );
}
