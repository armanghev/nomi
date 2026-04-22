import { AppSidebar } from "@/components/sidebar-01/app-sidebar";
import { StationTopbar } from "@/components/station/station-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type StationShellProps = {
  children: React.ReactNode;
};

export function StationShell({ children }: StationShellProps) {
  return (
    <SidebarProvider>
      <div className="relative flex h-svh w-full overflow-hidden bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <StationTopbar />
            <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
