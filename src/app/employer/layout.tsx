import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarNavMenuGroup } from "@/components/sidebar/sidebar-nav-menu-group";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { SidebarOrganizationButton } from "@/features/organizations/components/sidebar-organization-button";
import { getCurrentOrganization } from "@/services/clerk/lib/get-current-auth";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";

const EmployerLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <EmployerLayoutSuspense>{children}</EmployerLayoutSuspense>
    </Suspense>
  );
};

const EmployerLayoutSuspense = async ({
  children,
}: {
  children: ReactNode;
}) => {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return redirect("/organizations/select");

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <SidebarGroupAction title="Add Job Listing" asChild>
              <Link href="/employer/job-listings/new">
                <PlusIcon /> <span className="sr-only">Add Job Listing</span>
              </Link>
            </SidebarGroupAction>
          </SidebarGroup>
          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              {
                href: "/",
                icon: <ClipboardListIcon />,
                label: "Job Board",
              },
            ]}
          />
        </>
      }
      footerButton={<SidebarOrganizationButton />}
    >
      {children}
    </AppSidebar>
  );
};

export default EmployerLayout;
