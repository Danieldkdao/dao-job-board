import { getGlobalTag, getIdTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getUserGlobalTag = () => {
  return getGlobalTag("users");
};

export const getUserIdTag = (id: string) => {
  return getIdTag("users", id);
};

export const revalidateUserCache = (id: string) => {
  revalidateTag(getUserGlobalTag(), { expire: 0 });
  revalidateTag(getUserIdTag(id), { expire: 0 });
};
