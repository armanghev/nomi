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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <NavHeader />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <NavFooter user={data.user} />
    </Sidebar>
  );
}
