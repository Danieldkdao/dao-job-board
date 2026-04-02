import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helpers";
import { OrganizationTable } from "./organization";
import { relations } from "drizzle-orm";
import { JobListingApplicationTable } from "./job-listing-application";

export const wageIntervals = ["hourly", "yearly"] as const;
export type WageInterval = (typeof wageIntervals)[number];
export const wageIntervalEnum = pgEnum("wage_intervals", wageIntervals);

export const locationRequirements = ["in-office", "hybrid", "remote"] as const;
export type LocationRequirement = (typeof locationRequirements)[number];
export const locationRequirementEnum = pgEnum(
  "location_requirements",
  locationRequirements,
);

export const experienceLevels = ["junior", "mid-level", "senior"] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];
export const experienceLevelEnum = pgEnum(
  "experience_levels",
  experienceLevels,
);

export const jobListingStatuses = ["draft", "published", "delisted"] as const;
export type JobListingStatus = (typeof jobListingStatuses)[number];
export const jobListingStatusEnum = pgEnum(
  "job_listing_statuses",
  jobListingStatuses,
);

export const jobListingTypes = [
  "internship",
  "part-time",
  "full-time",
] as const;
export type JobListingType = (typeof jobListingTypes)[number];
export const jobListingTypeEnum = pgEnum("job_listing_type", jobListingTypes);

export const JobListingTable = pgTable(
  "job_listings",
  {
    id,
    organizationId: varchar("organization_id")
      .references(() => OrganizationTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title").notNull(),
    description: text("description").notNull(),
    wage: integer("wage"),
    wageInterval: wageIntervalEnum("wage_interval"),
    stateAbbreviation: varchar("state_abbreviation"),
    city: varchar("city"),
    isFeatured: boolean("is_featured").notNull().default(false),
    locationRequirement: locationRequirementEnum(
      "location_requirement",
    ).notNull(),
    experienceLevel: experienceLevelEnum("experience_level").notNull(),
    status: jobListingStatusEnum("status").notNull().default("draft"),
    type: jobListingTypeEnum("type").notNull(),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [index().on(t.stateAbbreviation)],
);

export const jobListingRelations = relations(
  JobListingTable,
  ({ one, many }) => ({
    organization: one(OrganizationTable, {
      fields: [JobListingTable.organizationId],
      references: [OrganizationTable.id],
    }),
    applications: many(JobListingApplicationTable),
  }),
);
