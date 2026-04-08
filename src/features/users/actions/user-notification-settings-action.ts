"use server";

import { getCurrentUser } from "@/services/clerk/lib/get-current-auth";
import {
  userNotificationSettingsSchema,
  UserNotificationSettingsSchemaType,
} from "./schemas";
import { updateUserNotificationSettings as updateUserNotificationSettingsDb } from "../db/user-notification-settings";

export const updateUserNotificationSettings = async (
  unsafeData: UserNotificationSettingsSchemaType,
) => {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return {
      error: true,
      message: "You must be signed in to update notification settings.",
    };
  }

  const { success, data } =
    userNotificationSettingsSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error updating your notification settings.",
    };
  }

  await updateUserNotificationSettingsDb(userId, data);

  return {
    error: false,
    message: "User notification settings saved successfully!",
  };
};
