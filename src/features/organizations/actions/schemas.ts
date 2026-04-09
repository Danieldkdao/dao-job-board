import z from "zod";

export const organizationUserSettingsSchema = z.object({
  newApplicationEmailNotifications: z.boolean(),
  minimumRating: z
    .number()
    .int()
    .positive()
    .min(1, { error: "Please enter a number between 1-5" })
    .max(5, { error: "Please enter a number between 1-5" })
    .nullable(),
});
export type OrganizationUserSettingsSchemaType = z.infer<
  typeof organizationUserSettingsSchema
>;
