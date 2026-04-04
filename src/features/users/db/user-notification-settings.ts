import { db } from "@/db/db";
import { UserNotificationSettingsTable } from "@/db/schema";
import { revalidateUserNotificationSettingsCache } from "./cache/user-notification-settings";

export const insertUserNotificationSettings = async (
  settings: typeof UserNotificationSettingsTable.$inferInsert,
) => {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();

  revalidateUserNotificationSettingsCache(settings.userId);
};
