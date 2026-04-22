import { AppSidebar } from "@/components/sidebar-01/app-sidebar";
import { StationTopbar } from "@/components/station/station-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type StationShellProps = {
  children: React.ReactNode;
};

export function StationShell({ children }: StationShellProps) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col bg-background">
          <div className="min-h-screen min-w-0">
            <StationTopbar />
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
