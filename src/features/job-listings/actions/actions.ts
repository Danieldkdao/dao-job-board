"use server";

import { getCurrentOrganization } from "@/services/clerk/lib/get-current-auth";
import { jobListingSchema, JobListingSchemaType } from "./schemas";
import { redirect } from "next/navigation";
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
} from "../db/job-listings";
import { cacheTag } from "next/cache";
import { getJobListingIdTag } from "../db/cache/job-listings";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/db/schema";

export const createJobListing = async (unsafeData: JobListingSchemaType) => {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
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

  if (!orgId) {
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
