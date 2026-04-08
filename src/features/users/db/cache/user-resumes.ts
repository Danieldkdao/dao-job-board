import { getGlobalTag, getIdTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getUserResumeGlobalTag = () => {
  return getGlobalTag("userResumes");
};

export const getUserResumeIdTag = (userId: string) => {
  return getIdTag("userResumes", userId);
};

export const revalidateUserResumeCache = (userId: string) => {
  revalidateTag(getUserResumeGlobalTag(), { expire: 0 });
  revalidateTag(getUserResumeIdTag(userId), { expire: 0 });
};
