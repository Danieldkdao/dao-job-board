import { db } from "@/db/db";
import { UserTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const getCurrentUser = async ({ allData = false }) => {
  const { userId } = await auth();

  return {
    userId,
    user: allData && userId !== null ? await getUser(userId) : undefined,
  };
};

const getUser = async (userId: string) => {
  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
  });
};
