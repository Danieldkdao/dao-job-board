"use server";

import { getCurrentOrganization } from "@/services/clerk/lib/get-current-auth";
import { jobListingSchema, JobListingSchemaType } from "./schemas";
import { redirect } from "next/navigation";
import { insertJobListing } from "../db/job-listings";

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
