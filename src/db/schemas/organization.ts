import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";
import { JobListingTable } from "./job-listing";
import { OrganizationUserSettingsTable } from "./organization-user-settings";

export const OrganizationTable = pgTable("organizations", {
  id: varchar().primaryKey(),
  name: varchar("name").notNull(),
  imageUrl: varchar("image_url"),
  createdAt,
  updatedAt,
});

export const organizationRelations = relations(
  OrganizationTable,
  ({ many }) => ({
    jobListings: many(JobListingTable),
    organizationUserSettings: many(OrganizationUserSettingsTable),
  }),
);
