import { db } from "@/db/db";
import { JobListingApplicationTable } from "@/db/schema";
import { revalidateJobListingApplicationCache } from "./db/cache/job-listing-applications";

export const insertJobListingApplication = async (
  application: typeof JobListingApplicationTable.$inferInsert,
) => {
  await db.insert(JobListingApplicationTable).values(application);

  revalidateJobListingApplicationCache(application);
};
