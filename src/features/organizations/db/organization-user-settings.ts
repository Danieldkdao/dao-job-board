import { db } from "@/db/db";
import { OrganizationUserSettingsTable } from "@/db/schema";
import { revalidateOrganizationUserSettingsCache } from "./cache/organization-user-settings";
import { and, eq } from "drizzle-orm";

export const insertOrganizationUserSettings = async (
  settings: typeof OrganizationUserSettingsTable.$inferInsert,
) => {
  await db
    .insert(OrganizationUserSettingsTable)
    .values(settings)
    .onConflictDoNothing();

  revalidateOrganizationUserSettingsCache(settings);
};

export const updateOrganizationUserSettings = async ({
  userId,
  organizationId,
  settings,
}: {
  userId: string;
  organizationId: string;
  settings: Partial<
    Omit<
      typeof OrganizationUserSettingsTable.$inferInsert,
      "userId" | "organizationId"
    >
  >;
}) => {
  await db
    .insert(OrganizationUserSettingsTable)
    .values({ ...settings, userId, organizationId })
    .onConflictDoUpdate({
      target: [
        OrganizationUserSettingsTable.userId,
        OrganizationUserSettingsTable.organizationId,
      ],
      set: settings,
    });

  revalidateOrganizationUserSettingsCache({ organizationId, userId });
};

export const deleteOrganizationUserSettings = async ({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) => {
  await db
    .delete(OrganizationUserSettingsTable)
    .where(
      and(
        eq(OrganizationUserSettingsTable.organizationId, organizationId),
        eq(OrganizationUserSettingsTable.userId, userId),
      ),
    );

  revalidateOrganizationUserSettingsCache({ userId, organizationId });
};
