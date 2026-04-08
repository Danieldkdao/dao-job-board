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

export const updateUserNotificationSettings = async (
  userId: string,
  data: Omit<
    Partial<typeof UserNotificationSettingsTable.$inferSelect>,
    "userId"
  >,
) => {
  await db
    .insert(UserNotificationSettingsTable)
    .values({ ...data, userId })
    .onConflictDoUpdate({
      target: UserNotificationSettingsTable.userId,
      set: data,
    });

  revalidateUserNotificationSettingsCache(userId);
};
