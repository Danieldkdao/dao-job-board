import { getGlobalTag, getIdTag, getOrganizationTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getJobListingGlobalTag = () => {
  return getGlobalTag("jobListings");
};

export const getJobListingOrganizationTag = (orgId: string) => {
  return getOrganizationTag("jobListings", orgId);
};

export const getJobListingIdTag = (id: string) => {
  return getIdTag("jobListings", id);
};

export const revalidateJobListingCache = ({
  orgId,
  id,
}: {
  orgId: string;
  id: string;
}) => {
  revalidateTag(getJobListingGlobalTag(), { expire: 0 });
  revalidateTag(getJobListingOrganizationTag(orgId), { expire: 0 });
  revalidateTag(getJobListingIdTag(id), { expire: 0 });
};
