import { db } from "@/db/db";
import { JobListingTable } from "@/db/schema";
import { revalidateJobListingCache } from "./cache/job-listings";

export const insertJobListing = async (
  jobListing: typeof JobListingTable.$inferInsert,
) => {
  const [insertedJobListing] = await db
    .insert(JobListingTable)
    .values(jobListing)
    .returning();

  revalidateJobListingCache({
    orgId: insertedJobListing.id,
    id: insertedJobListing.organizationId,
  });

  return insertedJobListing;
};
