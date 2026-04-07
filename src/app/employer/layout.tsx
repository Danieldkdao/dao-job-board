import { AsyncIf } from "@/components/async-if";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarNavMenuGroup } from "@/components/sidebar/sidebar-nav-menu-group";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { db } from "@/db/db";
import {
  JobListingApplicationTable,
  JobListingStatus,
  JobListingTable,
} from "@/db/schema";
import { getJobListingApplicationJobListingTag } from "@/features/job-listing-applications/db/cache/job-listing-applications";
import { getJobListingOrganizationTag } from "@/features/job-listings/db/cache/job-listings";
import { sortJobListingsByStatus } from "@/features/job-listings/lib/utils";
import { SidebarOrganizationButton } from "@/features/organizations/components/sidebar-organization-button";
import { getCurrentOrganization } from "@/services/clerk/lib/get-current-auth";
import { hasOrgUserPermission } from "@/services/clerk/lib/org-user-permissions";
import { desc, eq, sql } from "drizzle-orm";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";
import { JobListingMenuGroup } from "./_job-listing-menu-group";

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
            <AsyncIf
              condition={() => hasOrgUserPermission("org:job_listings:create")}
            >
              <SidebarGroupAction title="Add Job Listing" asChild>
                <Link href="/employer/job-listings/new">
                  <PlusIcon /> <span className="sr-only">Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            </AsyncIf>
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense>
                <JobListingMenu orgId={orgId} />
              </Suspense>
            </SidebarGroupContent>
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

const JobListingMenu = async ({ orgId }: { orgId: string }) => {
  const jobListings = await getJobListings(orgId);

  if (
    jobListings.length === 0 &&
    (await hasOrgUserPermission("org:job_listings:create"))
  ) {
    return (
      <SidebarMenuButton>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/employer/job-listings/new">
              <PlusIcon />
              <span>Create your first job listing</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenuButton>
    );
  }

  return Object.entries(Object.groupBy(jobListings, (j) => j.status))
    .sort(([a], [b]) => {
      return sortJobListingsByStatus(
        a as JobListingStatus,
        b as JobListingStatus,
      );
    })
    .map(([status, jobListings]) => (
      <JobListingMenuGroup
        key={status as JobListingStatus}
        status={status as JobListingStatus}
        jobListings={jobListings}
      />
    ));
};

export default EmployerLayout;

const getJobListings = async (orgId: string) => {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  const data = await db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      status: JobListingTable.status,
      applicationCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${JobListingApplicationTable} jlat
        WHERE jlat.job_listing_id = ${JobListingTable.id}
      )`,
    })
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, orgId))
    .orderBy(desc(JobListingTable.createdAt));

  data.forEach((jl) => {
    cacheTag(getJobListingApplicationJobListingTag(jl.id));
  });

  return data;
};
