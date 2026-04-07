import { getGlobalTag, getIdTag, getJobListingTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getJobListingApplicationGlobalTag = () => {
  return getGlobalTag("jobListingApplications");
};

export const getJobListingApplicationJobListingTag = (jobListingId: string) => {
  return getJobListingTag("jobListingApplications", jobListingId);
};

export const getJobListingApplicationIdTag = ({
  jobListingId,
  userId,
}: {
  jobListingId: string;
  userId: string;
}) => {
  return getIdTag("jobListingApplications", `${jobListingId}-${userId}`);
};

export const revalidateJobListingApplicationCache = (id: {
  userId: string;
  jobListingId: string;
}) => {
  revalidateTag(getJobListingApplicationGlobalTag(), { expire: 0 });
  revalidateTag(getJobListingApplicationJobListingTag(id.jobListingId), {
    expire: 0,
  });
  revalidateTag(getJobListingApplicationIdTag(id), { expire: 0 });
};
