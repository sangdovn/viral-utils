import { NavLink, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { routes } from "@/routes";

export default function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="none" className="border-r">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-base">Viral Utils</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map(({ path, label }) => (
                <SidebarMenuItem key={path}>
                  <SidebarMenuButton
                    asChild
                    className="h-11"
                    isActive={path === "/" ? pathname === "/" : pathname.startsWith(path)}
                  >
                    <NavLink to={path} end>
                      <span className="text-sm">{label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
