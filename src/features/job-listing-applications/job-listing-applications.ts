import { db } from "@/db/db";
import { JobListingApplicationTable } from "@/db/schema";
import { revalidateJobListingApplicationCache } from "./db/cache/job-listing-applications";
import { and, eq } from "drizzle-orm";

export const insertJobListingApplication = async (
  application: typeof JobListingApplicationTable.$inferInsert,
) => {
  await db.insert(JobListingApplicationTable).values(application);

  revalidateJobListingApplicationCache(application);
};

export const updateJobListingApplication = async ({
  jobListingId,
  userId,
  application,
}: {
  jobListingId: string;
  userId: string;
  application: Partial<typeof JobListingApplicationTable.$inferSelect>;
}) => {
  await db
    .update(JobListingApplicationTable)
    .set(application)
    .where(
      and(
        eq(JobListingApplicationTable.userId, userId),
        eq(JobListingApplicationTable.jobListingId, jobListingId),
      ),
    );

  revalidateJobListingApplicationCache({ jobListingId, userId });
};
