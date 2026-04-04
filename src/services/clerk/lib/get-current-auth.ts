import { db } from "@/db/db";
import { OrganizationTable, UserTable } from "@/db/schema";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organization";
import { getUserIdTag } from "@/features/users/db/cache/users";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

export const getCurrentUser = async ({ allData = false }) => {
  const { userId } = await auth();

  return {
    userId,
    user: allData && userId !== null ? await getUser(userId) : undefined,
  };
};

const getUser = async (userId: string) => {
  "use cache";
  cacheTag(getUserIdTag(userId));

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
  });
};

export const getCurrentOrganization = async ({ allData = false }) => {
  const { orgId } = await auth();

  return {
    orgId,
    organization: allData && orgId ? await getOrganization(orgId) : undefined,
  };
};

const getOrganization = async (orgId: string) => {
  "use cache";
  cacheTag(getOrganizationIdTag(orgId));

  return db.query.OrganizationTable.findFirst({
    where: eq(OrganizationTable.id, orgId),
  });
};
