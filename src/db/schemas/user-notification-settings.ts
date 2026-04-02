import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const UserNotificationSettingsTable = pgTable(
  "user_notification_settings",
  {
    userId: varchar("user_id")
      .primaryKey()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    newJobEmailNotifications: boolean("new_job_email_notifications")
      .notNull()
      .default(false),
    aiPrompt: varchar("ai_prompt"),
    createdAt,
    updatedAt,
  },
);

export const userNotificationSettingsRelations = relations(
  UserNotificationSettingsTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserNotificationSettingsTable.userId],
      references: [UserTable.id],
    }),
  }),
);
