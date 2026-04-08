"use server";

import { getCurrentUser } from "@/services/clerk/lib/get-current-auth";
import {
  newJobListingApplicationSchema,
  NewJobListingApplicationSchemaType,
} from "./schemas";
import { cacheTag } from "next/cache";
import { getJobListingIdTag } from "@/features/job-listings/db/cache/job-listings";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable, UserResumeTable } from "@/db/schema";
import { getUserResumeIdTag } from "@/features/users/db/cache/user-resumes";
import { insertJobListingApplication } from "../job-listing-applications";
import { inngest } from "@/services/inngest/client";

export const createJobListingApplication = async (
  jobListingId: string,
  unsafeData: NewJobListingApplicationSchemaType,
) => {
  const { userId } = await getCurrentUser();
  if (!userId)
    return {
      error: true,
      message: "Please sign in to submit an application.",
    };

  const [userResume, jobListing] = await Promise.all([
    getUserResume(userId),
    getPublicJobListing(jobListingId),
  ]);

  if (!userResume || !jobListing)
    return {
      error: true,
      message: "Invalid data.",
    };

  const { success, data } =
    newJobListingApplicationSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There was an error submitting your application.",
    };

  await insertJobListingApplication({
    jobListingId,
    userId,
    ...data,
  });

  await inngest.send({
    name: "app/job-listing-application.created",
    data: { jobListingId, userId },
  });

  return {
    error: false,
    message: "Your application was successfully submitted.",
  };
};

const getPublicJobListing = async (id: string) => {
  "use cache";
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published"),
    ),
    columns: { id: true },
  });
};

const getUserResume = async (userId: string) => {
  "use cache";
  cacheTag(getUserResumeIdTag(userId));

  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: { userId: true },
  });
};
