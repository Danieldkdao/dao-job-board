import { pgTable, varchar } from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const UserResumeTable = pgTable("user_resumes", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  resumeFileUrl: varchar("resume_file_url").notNull(),
  resumeFileKey: varchar("resume_file_key").notNull(),
  aiSummary: varchar("ai_summary"),
  createdAt,
  updatedAt,
});

export const useResumeRelations = relations(UserResumeTable, ({ one }) => ({
  userId: one(UserTable, {
    fields: [UserResumeTable.userId],
    references: [UserTable.id],
  }),
}));
