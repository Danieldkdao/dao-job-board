import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db/db";
import { JobListingTable } from "@/db/schema";
import { JobListingForm } from "@/features/job-listings/components/job-listing-form";
import { getJobListingIdTag } from "@/features/job-listings/db/cache/job-listings";
import { getCurrentOrganization } from "@/services/clerk/lib/get-current-auth";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type JobListingEditProps = {
  params: Promise<{ jobListingId: string }>;
};

const JobListingIdEditPage = (props: JobListingEditProps) => {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>
      <Card>
        <CardContent>
          <Suspense>
            <SuspendedPage {...props} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

const SuspendedPage = async ({ params }: JobListingEditProps) => {
  const { jobListingId } = await params;
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return notFound();

  const jobListing = await getJobListing({ jobListingId, orgId });
  if (!jobListing) return notFound();

  return <JobListingForm jobListing={jobListing} />;
};

export default JobListingIdEditPage;

const getJobListing = async ({
  jobListingId,
  orgId,
}: {
  jobListingId: string;
  orgId: string;
}) => {
  "use cache";
  cacheTag(getJobListingIdTag(jobListingId));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.organizationId, orgId),
    ),
  });
};
