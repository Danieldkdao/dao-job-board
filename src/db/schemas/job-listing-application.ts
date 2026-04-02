import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { JobListingTable } from "./job-listing";
import { UserTable } from "./user";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const applicationStages = [
  "denied",
  "applied",
  "interested",
  "interviewed",
  "hired",
] as const;
export type ApplicationStage = (typeof applicationStages)[number];
export const applicationStageEnum = pgEnum(
  "application_stages",
  applicationStages,
);

export const JobListingApplicationTable = pgTable(
  "job_listing_applications",
  {
    jobListingId: uuid("job_listing_id")
      .references(() => JobListingTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    coverLetter: text("cover_letter"),
    rating: integer("rating"),
    stage: applicationStageEnum("stage").notNull().default("applied"),
    createdAt,
    updatedAt,
  },
  (t) => [primaryKey({ columns: [t.jobListingId, t.userId] })],
);

export const jobListingApplicationRelations = relations(
  JobListingApplicationTable,
  ({ one }) => ({
    jobListing: one(JobListingTable, {
      fields: [JobListingApplicationTable.jobListingId],
      references: [JobListingTable.id],
    }),
    user: one(UserTable, {
      fields: [JobListingApplicationTable.userId],
      references: [UserTable.id],
    }),
  }),
);
