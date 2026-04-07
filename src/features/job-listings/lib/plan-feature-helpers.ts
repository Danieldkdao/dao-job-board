import { getCurrentOrganization } from "@/services/clerk/lib/get-current-auth";
import { cacheTag } from "next/cache";
import { getJobListingOrganizationTag } from "../db/cache/job-listings";
import { db } from "@/db/db";
import { and, count, eq } from "drizzle-orm";
import { JobListingTable } from "@/db/schema";
import { hasPlanFeature } from "@/services/clerk/lib/plan-features";

export const hasReachedMaxPublishedJobListings = async () => {
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return true;

  const count = await getPublishedJobListingsCount(orgId);

  const canPost = await Promise.all([
    hasPlanFeature("post_1_job_listing").then((has) => has && count < 1),
    hasPlanFeature("post_3_job_listings").then((has) => has && count < 3),
    hasPlanFeature("post_15_job_listings").then((has) => has && count < 15),
  ]);

  return !canPost.some(Boolean);
};

export const hasReachedMaxFeaturedJobListings = async () => {
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return true;

  const count = await getFeaturedJobListingsCount(orgId);

  const canFeature = await Promise.all([
    hasPlanFeature("1_featured_job_listing").then((has) => has && count < 1),
    hasPlanFeature("unlimited_featured_job_listings"),
  ]);

  return !canFeature.some(Boolean);
};

const getPublishedJobListingsCount = async (orgId: string) => {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  const [res] = await db
    .select({ count: count() })
    .from(JobListingTable)
    .where(
      and(
        eq(JobListingTable.status, "published"),
        eq(JobListingTable.organizationId, orgId),
      ),
    );

  return res?.count ?? 0;
};

const getFeaturedJobListingsCount = async (orgId: string) => {
  "use cache";
  cacheTag(getJobListingOrganizationTag(orgId));

  const [res] = await db
    .select({ count: count() })
    .from(JobListingTable)
    .where(
      and(
        eq(JobListingTable.isFeatured, true),
        eq(JobListingTable.organizationId, orgId),
      ),
    );

  return res?.count ?? 0;
};
