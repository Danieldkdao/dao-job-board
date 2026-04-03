import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarUserButton } from "@/features/users/components/sidebar-user-button";
import { SignInStatus } from "@/services/clerk/components/sign-in-status";
import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { AppSidebarClient } from "./_app-sidebar-client";

const HomePage = () => {
  return (
    <SidebarProvider className="overflow-y-hidden">
      <AppSidebarClient>
        <Sidebar collapsible="icon" className="overflow-hidden">
          <SidebarHeader className="flex-row">
            <SidebarTrigger />
            <span className="text-xl text-nowrap">DAO Jobs</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SignInStatus when="signed-out">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/sign-in">
                        <LogInIcon />
                        <span>Log In</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SignInStatus>
            </SidebarGroup>
          </SidebarContent>
          <SignInStatus>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarUserButton />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignInStatus>
        </Sidebar>

        <main className="flex-1">fdfdhfdhdhfhf</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
};
export default HomePage;
