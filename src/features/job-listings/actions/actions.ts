"use server";

import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/get-current-auth";
import {
  jobListingAiSearchSchema,
  JobListingAiSearchSchemaType,
  jobListingSchema,
  JobListingSchemaType,
} from "./schemas";
import { redirect } from "next/navigation";
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
  deleteJobListing as deleteJobListingDb,
} from "../db/job-listings";
import { cacheTag } from "next/cache";
import { getJobListingIdTag } from "../db/cache/job-listings";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/db/schema";
import { hasOrgUserPermission } from "@/services/clerk/lib/org-user-permissions";
import { getNextJobListingStatus } from "../lib/utils";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "../lib/plan-feature-helpers";
import { getMatchingJobListings } from "@/services/inngest/ai/get-matching-job-listings";

export const createJobListing = async (unsafeData: JobListingSchemaType) => {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission("org:job_listings:create"))) {
    return {
      error: true,
      message: "You don't have permission to create a job listing.",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error creatig your job listing.",
    };
  }

  const jobListing = await insertJobListing({
    ...data,
    organizationId: orgId,
    status: "draft",
  });

  redirect(`/employer/job-listings/${jobListing.id}`);
};

export const updateJobListing = async (
  id: string,
  unsafeData: JobListingSchemaType,
) => {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission("org:job_listings:update"))) {
    return {
      error: true,
      message: "You don't have permission to update this job listing.",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error updating your job listing",
    };
  }

  const jobListing = await getJobListing(id, orgId);
  if (!jobListing) {
    return {
      error: true,
      message: "Job not found",
    };
  }

  const updatedJobListing = await updateJobListingDb(jobListing.id, data);

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
};

export const deleteJobListing = async (id: string) => {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission("org:job_listings:delete"))) {
    return {
      error: true,
      message: "You don't have permission to delete this job listing.",
    };
  }

  const jobListing = await getJobListing(id, orgId);
  if (!jobListing) {
    return {
      error: true,
      message: "Job not found",
    };
  }

  await deleteJobListingDb(id);

  redirect("/employer");
};

export const toggleJobListingStatus = async (id: string) => {
  const { orgId } = await getCurrentOrganization();
  if (
    !orgId ||
    !(await hasOrgUserPermission("org:job_listings:change_status"))
  ) {
    return {
      error: true,
      message:
        "You don't have permission to change the status of this job listing.",
    };
  }

  const jobListing = await getJobListing(id, orgId);
  if (!jobListing) {
    return {
      error: true,
      message: "Job listing not found.",
    };
  }

  const newStatus = getNextJobListingStatus(jobListing.status);
  if (
    newStatus === "published" &&
    (await hasReachedMaxPublishedJobListings())
  ) {
    return {
      error: true,
      message: "Please upgrade your plan to publish more job listings.",
    };
  }

  await updateJobListingDb(id, {
    status: newStatus,
    isFeatured: newStatus === "published" ? undefined : false,
    postedAt:
      newStatus === "published" && !jobListing.postedAt
        ? new Date()
        : undefined,
  });

  return {
    error: false,
    message: "Job listing status toggled successfully!",
  };
};

export const toggleJobListingFeatured = async (id: string) => {
  const { orgId } = await getCurrentOrganization();
  if (
    !orgId ||
    !(await hasOrgUserPermission("org:job_listings:change_status"))
  ) {
    return {
      error: true,
      message:
        "You don't have permission to change the featured status of this job listing.",
    };
  }

  const jobListing = await getJobListing(id, orgId);
  if (!jobListing) {
    return {
      error: true,
      message: "Job listing not found.",
    };
  }

  const newFeaturedStatus = !jobListing.isFeatured;
  if (newFeaturedStatus && (await hasReachedMaxFeaturedJobListings())) {
    return {
      error: true,
      message: "Please upgrade your plan to feature more job listings.",
    };
  }

  await updateJobListingDb(id, {
    isFeatured: newFeaturedStatus,
  });

  return {
    error: false,
    message: "Job listing featured status toggled successfully!",
  };
};

export const getAiJobListingSearchResults = async (
  unsafeData: JobListingAiSearchSchemaType,
): Promise<
  { error: true; message: string } | Promise<{ error: false; jobIds: string[] }>
> => {
  const { success, data } = jobListingAiSearchSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error processing your search query.",
    };
  }

  const { userId } = await getCurrentUser();

  if (!userId) {
    return {
      error: true,
      message: "You need an account to use AI job search.",
    };
  }

  const publishedJobListings = await getPublishedJobListingsForAiSearch();

  const jobSearchResults = await getMatchingJobListings({
    prompt: data.query,
    jobListings: publishedJobListings.map((jobListing) => ({
      ...jobListing,
      organizationName: jobListing.organization.name,
    })),
    maxNumberOfJobs: 10,
  });

  if (jobSearchResults.length === 0) {
    return {
      error: true,
      message: "No jobs found that match your search criteria.",
    };
  }

  return { error: false, jobIds: jobSearchResults };
};

const getPublishedJobListingsForAiSearch = async () => {
  return db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, "published"),
    columns: {
      id: true,
      title: true,
      description: true,
      wage: true,
      wageInterval: true,
      stateAbbreviation: true,
      city: true,
      locationRequirement: true,
      experienceLevel: true,
      type: true,
      postedAt: true,
    },
    with: {
      organization: {
        columns: {
          name: true,
        },
      },
    },
  });
};

const getJobListing = async (id: string, orgId: string) => {
  "use cache";
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId),
    ),
  });
};
