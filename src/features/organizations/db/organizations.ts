import { db } from "@/db/db";
import { OrganizationTable } from "@/db/schema";
import { revalidateOrganizationCache } from "./cache/organization";
import { eq } from "drizzle-orm";

export const insertOrganization = async (
  organization: typeof OrganizationTable.$inferInsert,
) => {
  await db.insert(OrganizationTable).values(organization).onConflictDoNothing();

  revalidateOrganizationCache(organization.id);
};

export const updateOrganization = async (
  id: string,
  organization: Partial<typeof OrganizationTable.$inferInsert>,
) => {
  await db
    .update(OrganizationTable)
    .set(organization)
    .where(eq(OrganizationTable.id, id));

  revalidateOrganizationCache(id);
};

export const deleteOrganization = async (id: string) => {
  await db.delete(OrganizationTable).where(eq(OrganizationTable.id, id));

  revalidateOrganizationCache(id);
};
