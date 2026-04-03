import { db } from "@/db/db";
import { UserTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const insertUser = async (user: typeof UserTable.$inferInsert) => {
  await db.insert(UserTable).values(user).onConflictDoNothing();
};

export const updateUser = async (
  id: string,
  user: Partial<typeof UserTable.$inferInsert>,
) => {
  await db.update(UserTable).set(user).where(eq(UserTable.id, id));
};

export const deleteUser = async (userId: string) => {
  await db.delete(UserTable).where(eq(UserTable.id, userId));
};
