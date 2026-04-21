"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuItem as SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";

export type Route = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  link: string;
  subs?: {
    title: string;
    link: string;
    icon?: React.ReactNode;
  }[];
};

export default function DashboardNavigation({ routes }: { routes: Route[] }) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

  return (
    <SidebarMenu>
      {routes.map((route) => {
        const isOpen = !isCollapsed && openCollapsible === route.id;
        const hasSubRoutes = !!route.subs?.length;
        const isRouteActive =
          pathname === route.link || pathname.startsWith(`${route.link}/`);
        const isSubRouteActive = route.subs?.some(
          (subRoute) =>
            pathname === subRoute.link || pathname.startsWith(`${subRoute.link}/`)
        );
        const isActive = Boolean(isRouteActive || isSubRouteActive);

        return (
          <SidebarMenuItem key={route.id}>
            {hasSubRoutes ? (
              <Collapsible
                open={isOpen}
                onOpenChange={(open) =>
                  setOpenCollapsible(open ? route.id : null)
                }
                className="w-full"
              >
                <CollapsibleTrigger render={<SidebarMenuButton className={cn(
                                              "flex w-full items-center rounded-lg px-2 transition-colors",
                                              isActive || isOpen
                                                ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                                                : "text-muted-foreground hover:bg-sidebar-muted hover:text-foreground",
                                              isCollapsed && "justify-center"
                                            )} />}>{route.icon}{!isCollapsed && (
                                              <span className="ml-2 flex-1 text-sm font-medium">
                                                {route.title}
                                              </span>
                                            )}{!isCollapsed && hasSubRoutes && (
                                              <span className="ml-auto">
                                                {isOpen ? (
                                                  <ChevronUp className="size-4" />
                                                ) : (
                                                  <ChevronDown className="size-4" />
                                                )}
                                              </span>
                                            )}</CollapsibleTrigger>

                {!isCollapsed && (
                  <CollapsibleContent>
                    <SidebarMenuSub className="my-1 ml-3.5 ">
                      {route.subs?.map((subRoute) => (
                        <SidebarMenuSubItem
                          key={`${route.id}-${subRoute.title}`}
                          className="h-auto"
                        >
                          <SidebarMenuSubButton render={<Link href={subRoute.link} prefetch={true} className={cn(
                            "flex items-center rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-muted hover:text-foreground",
                            pathname === subRoute.link || pathname.startsWith(`${subRoute.link}/`)
                              ? "bg-sidebar-muted text-foreground"
                              : ""
                          )} />}>{subRoute.title}</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </Collapsible>
            ) : (
              <SidebarMenuButton tooltip={route.title} render={<Link href={route.link} prefetch={true} className={cn(
                                            "flex items-center rounded-lg px-2 transition-colors text-muted-foreground hover:bg-sidebar-muted hover:text-foreground",
                                            isActive
                                              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                                              : "",
                                            isCollapsed && "justify-center"
                                          )} />}>{route.icon}{!isCollapsed && (
                                            <span className="ml-2 text-sm font-medium">
                                              {route.title}
                                            </span>
                                          )}</SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
