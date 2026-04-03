import { db } from "@/db/db";
import { UserNotificationSettingsTable } from "@/db/schema";

export const insertUserNotificationSettings = async (
  settings: typeof UserNotificationSettingsTable.$inferInsert,
) => {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();
};
