import { db } from "@/db/db";
import { JobListingTable } from "@/db/schema";
import { revalidateJobListingCache } from "./cache/job-listings";
import { eq } from "drizzle-orm";

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

export const updateJobListing = async (
  id: string,
  jobListing: Partial<typeof JobListingTable.$inferInsert>,
) => {
  const [updatedListing] = await db
    .update(JobListingTable)
    .set(jobListing)
    .where(eq(JobListingTable.id, id))
    .returning();

  revalidateJobListingCache({
    id: updatedListing.id,
    orgId: updatedListing.organizationId,
  });

  return updatedListing;
};

export const deleteJobListing = async (id: string) => {
  const [deletedJobListing] = await db
    .delete(JobListingTable)
    .where(eq(JobListingTable.id, id))
    .returning();

  revalidateJobListingCache({
    id: deletedJobListing.id,
    orgId: deletedJobListing.organizationId,
  });

  return deletedJobListing;
};
