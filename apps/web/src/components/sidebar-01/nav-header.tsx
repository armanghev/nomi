"use client";

import Image from "next/image";
import { SidebarHeader } from "@/components/ui/sidebar";

export function NavHeader() {
  return (
    <SidebarHeader className="px-3 py-3">
      <div className="flex items-end gap-1">
        <Image
          src="/nomi.png"
          alt="Nomi"
          width={40}
          height={40}
          className="h-7 w-7 object-contain"
          priority
        />
        <span className="font-nomi text-lg text-foreground font-medium leading-none tracking-tight">
          nomi
        </span>
      </div>
    </SidebarHeader>
  );
}
