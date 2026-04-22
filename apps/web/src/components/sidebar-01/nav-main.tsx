"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { NavItem } from "./types";

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? "";

  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            Boolean(item.url) &&
            (pathname === item.url || pathname.startsWith(`${item.url}/`));

          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                tooltip={item.title}
                render={
                  item.url ? (
                    <Link
                      href={item.url}
                      prefetch
                      className={cn(
                        "flex items-center",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                          : ""
                      )}
                    />
                  ) : undefined
                }
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
