import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/db/schema";
import z from "zod";

export const jobListingSchema = z
  .object({
    title: z.string().trim().min(1, { error: "Please enter a title." }),
    description: z
      .string()
      .trim()
      .min(1, { error: "Please enter a description." }),
    experienceLevel: z.enum(experienceLevels),
    locationRequirement: z.enum(locationRequirements),
    type: z.enum(jobListingTypes),
    wage: z
      .number()
      .int({ error: "Please enter a positive integer greater than 1." })
      .positive({ error: "Please enter a positive integer greater than 1." })
      .min(1, { error: "Please enter a positive integer greater than 1." })
      .nullable(),
    wageInterval: z.enum(wageIntervals).nullable(),
    stateAbbreviation: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable(),
    city: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable(),
  })
  .refine(
    (listing) => {
      return listing.locationRequirement === "remote" || listing.city != null;
    },
    { error: "Required for non-remote listings.", path: ["city"] },
  )
  .refine(
    (listing) => {
      return (
        listing.locationRequirement === "remote" ||
        listing.stateAbbreviation != null
      );
    },
    { error: "Required for non-remote listings.", path: ["stateAbbreviation"] },
  );

export type JobListingSchemaType = z.infer<typeof jobListingSchema>;
