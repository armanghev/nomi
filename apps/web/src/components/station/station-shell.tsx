import { AppSidebar } from "@/components/sidebar-01/app-sidebar";
import { InspectorDrawer } from "@/components/station/inspector-drawer";
import { StationInspector } from "@/components/station/station-inspector";
import { StationTopbar } from "@/components/station/station-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type StationShellProps = {
  children: React.ReactNode;
  inspector?: React.ReactNode;
};

export function StationShell({ children, inspector }: StationShellProps) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col bg-background">
          <div className="grid min-h-screen xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0">
              <StationTopbar />
              <main className="p-4 lg:p-6">{children}</main>
            </div>
            <InspectorDrawer>{inspector ?? <StationInspector />}</InspectorDrawer>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
