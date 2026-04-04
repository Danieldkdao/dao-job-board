import { db } from "@/db/db";
import { UserTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateUserCache } from "./cache/users";

export const insertUser = async (user: typeof UserTable.$inferInsert) => {
  await db.insert(UserTable).values(user).onConflictDoNothing();

  revalidateUserCache(user.id);
};

export const updateUser = async (
  id: string,
  user: Partial<typeof UserTable.$inferInsert>,
) => {
  await db.update(UserTable).set(user).where(eq(UserTable.id, id));

  revalidateUserCache(id);
};

export const deleteUser = async (userId: string) => {
  await db.delete(UserTable).where(eq(UserTable.id, userId));

  revalidateUserCache(userId);
};
