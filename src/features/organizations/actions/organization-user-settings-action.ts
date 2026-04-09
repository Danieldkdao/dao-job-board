"use server";

import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/get-current-auth";
import {
  organizationUserSettingsSchema,
  OrganizationUserSettingsSchemaType,
} from "./schemas";
import { updateOrganizationUserSettings as updateOrganizationUserSettingsDb } from "../db/organization-user-settings";

export const updateOrganizationUserSettings = async (
  unsafeData: OrganizationUserSettingsSchemaType,
) => {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  if (!userId || !orgId) {
    return {
      error: true,
      message: "You must be signed in to update notification settings.",
    };
  }

  const { success, data } =
    organizationUserSettingsSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error updating your notification settings.",
    };
  }

  await updateOrganizationUserSettingsDb({
    userId,
    organizationId: orgId,
    settings: data,
  });

  return {
    error: false,
    message: "Successfully updated your notification settings.",
  };
};
