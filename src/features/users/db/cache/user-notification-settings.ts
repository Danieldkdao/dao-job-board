import { getGlobalTag, getIdTag } from "@/lib/data-cache";
import { revalidateTag } from "next/cache";

export const getUserNotificationSettingsGlobalTag = () => {
  return getGlobalTag("userNotificationSettings");
};

export const getUserNotificationSettingsIdTag = (userId: string) => {
  return getIdTag("userNotificationSettings", userId);
};

export const revalidateUserNotificationSettingsCache = (userId: string) => {
  revalidateTag(getUserNotificationSettingsGlobalTag(), { expire: 0 });
  revalidateTag(getUserNotificationSettingsIdTag(userId), { expire: 0 });
};
