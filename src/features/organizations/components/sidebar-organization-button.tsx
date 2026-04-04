import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/get-current-auth";
import { Suspense } from "react";
import { SidebarOrganizationButtonClient } from "./_sidebar-organization-button-client";
import { SignOutButton } from "@/services/clerk/components/auth-buttons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";

export const SidebarOrganizationButton = () => {
  return (
    <Suspense>
      <SidebarOrganizationSuspense />
    </Suspense>
  );
};

const SidebarOrganizationSuspense = async () => {
  const [{ user }, { organization }] = await Promise.all([
    getCurrentUser({ allData: true }),
    getCurrentOrganization({ allData: true }),
  ]);

  if (user == null || organization == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return (
    <SidebarOrganizationButtonClient user={user} organization={organization} />
  );
};
