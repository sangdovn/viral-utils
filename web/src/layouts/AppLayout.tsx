import { Outlet } from "react-router";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";

export function AppLayout() {
  return (
    <SidebarProvider className="flex">
      <AppSidebar />

      <main className="flex-1 p-6">
        <SidebarTrigger />

        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  );
}
