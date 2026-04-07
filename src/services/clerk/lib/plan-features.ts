import { auth } from "@clerk/nextjs/server";

export type PlanFeature =
  | "post_1_job_listing"
  | "post_3_job_listings"
  | "post_15_job_listings"
  | "unlimited_featured_job_listings"
  | "1_featured_job_listing";

export const hasPlanFeature = async (feature: PlanFeature) => {
  const { has } = await auth();
  return has({ feature });
};
