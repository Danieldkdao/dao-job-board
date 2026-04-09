"use server";

import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/get-current-auth";
import {
  newJobListingApplicationSchema,
  NewJobListingApplicationSchemaType,
} from "./schemas";
import { cacheTag } from "next/cache";
import { getJobListingIdTag } from "@/features/job-listings/db/cache/job-listings";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import {
  ApplicationStage,
  applicationStages,
  JobListingTable,
  UserResumeTable,
} from "@/db/schema";
import { getUserResumeIdTag } from "@/features/users/db/cache/user-resumes";
import {
  insertJobListingApplication,
  updateJobListingApplication,
} from "../job-listing-applications";
import { inngest } from "@/services/inngest/client";
import z from "zod";
import { hasOrgUserPermission } from "@/services/clerk/lib/org-user-permissions";

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

export const updateJobListingApplicationStage = async ({
  jobListingId,
  userId,
  unsafeStage,
}: {
  jobListingId: string;
  userId: string;
  unsafeStage: ApplicationStage;
}) => {
  const { success, data: stage } = z
    .enum(applicationStages)
    .safeParse(unsafeStage);

  if (!success) {
    return {
      error: true,
      message: "Invalid stage",
    };
  }

  if (
    !(await hasOrgUserPermission("org:job_listing_applications:change_stage"))
  ) {
    return {
      error: true,
      message: "You don't have permission to update the stage.",
    };
  }

  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);
  if (!orgId || !jobListing || orgId !== jobListing.organizationId) {
    return {
      error: true,
      message: "You don't have permission to update the stage.",
    };
  }

  await updateJobListingApplication({
    jobListingId,
    userId,
    application: {
      stage,
    },
  });

  return {
    error: false,
    message: "Job listing stage updated successfully!",
  };
};

export const updateJobListingApplicationRating = async ({
  jobListingId,
  userId,
  unsafeRating,
}: {
  jobListingId: string;
  userId: string;
  unsafeRating: number | null;
}) => {
  const { success, data: rating } = z
    .number()
    .min(1)
    .max(5)
    .nullish()
    .safeParse(unsafeRating);

  if (!success) {
    return {
      error: true,
      message: "Invalid rating",
    };
  }

  if (
    !(await hasOrgUserPermission("org:job_listing_applications:change_rating"))
  ) {
    return {
      error: true,
      message: "You don't have permission to update the rating.",
    };
  }

  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);
  if (!orgId || !jobListing || orgId !== jobListing.organizationId) {
    return {
      error: true,
      message: "You don't have permission to update the rating.",
    };
  }

  await updateJobListingApplication({
    jobListingId,
    userId,
    application: {
      rating,
    },
  });

  return {
    error: false,
    message: "Job listing rating updated successfully!",
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

const getJobListing = async (id: string) => {
  "use cache";
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.id, id),
    columns: {
      organizationId: true,
    },
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
