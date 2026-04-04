import { getGlobalTag, getIdTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getOrganizationGlobalTag = () => {
  return getGlobalTag("organizations");
};

export const getOrganizationIdTag = (id: string) => {
  return getIdTag("organizations", id);
};

export const revalidateOrganizationCache = (id: string) => {
  revalidateTag(getOrganizationGlobalTag(), { expire: 0 });
  revalidateTag(getOrganizationIdTag(id), { expire: 0 });
};
