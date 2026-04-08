import { getGlobalTag, getIdTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getOrganizationUserSettingsGlobalTag = () => {
  return getGlobalTag("organizationUserSettings");
};

export const getOrganizationUserSettingsIdTag = ({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) => {
  return getIdTag("organizationUserSettings", `${organizationId}-${userId}`);
};

export const revalidateOrganizationUserSettingsCache = (id: {
  organizationId: string;
  userId: string;
}) => {
  revalidateTag(getOrganizationUserSettingsGlobalTag(), { expire: 0 });
  revalidateTag(getOrganizationUserSettingsIdTag(id), { expire: 0 });
};
