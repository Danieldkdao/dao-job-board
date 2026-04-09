import { SignInStatus } from "@/services/clerk/components/sign-in-status";
import { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/sidebar";
import { AppSidebarClient } from "./_app-sidebar-client";
import { ThemeToggle } from "../theme-toggle";

type AppSidebarProps = {
  content: ReactNode;
  footerButton: ReactNode;
  children: ReactNode;
};

export const AppSidebar = ({
  content,
  footerButton,
  children,
}: AppSidebarProps) => {
  return (
    <SidebarProvider className="overflow-y-hidden">
      <AppSidebarClient>
        <Sidebar collapsible="icon" className="overflow-hidden">
          <SidebarHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-xl text-nowrap">DAO Jobs</span>
            </div>
            <ThemeToggle />
          </SidebarHeader>
          <SidebarContent>{content}</SidebarContent>
          <SignInStatus>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>{footerButton}</SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignInStatus>
        </Sidebar>

        <main className="flex-1">{children}</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
};
