import z from "zod";

export const newJobListingApplicationSchema = z.object({
  coverLetter: z
    .string()
    .transform((val) => (val.trim() ? val : null))
    .nullable(),
});

export type NewJobListingApplicationSchemaType = z.infer<
  typeof newJobListingApplicationSchema
>;
