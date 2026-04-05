import { db } from "@/db/db";
import { JobListingTable } from "@/db/schema";
import { getJobListingOrganizationTag } from "@/features/job-listings/db/cache/job-listings";
import { getCurrentOrganization } from "@/services/clerk/lib/get-current-auth";
import { desc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const EmployerHomePage = () => {
  return (
    <Suspense>
      <EmployerHomePageSuspense />
    </Suspense>
  );
};

const EmployerHomePageSuspense = async () => {
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return null;

  const jobListing = await getMostRecentJobListing(orgId);
  if (!jobListing) {
    redirect("/employer/job-listings/new");
  } else {
    redirect(`/employer/job-listings/${jobListing.id}`);
  }
};

export default EmployerHomePage;

const getMostRecentJobListing = async (orgId: string) => {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  return db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.organizationId, orgId),
    orderBy: desc(JobListingTable.createdAt),
    columns: { id: true },
  });
};
