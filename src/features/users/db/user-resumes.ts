import { db } from "@/db/db";
import { UserResumeTable } from "@/db/schema";
import { revalidateUserResumeCache } from "./cache/user-resumes";

export const upsertUserResume = async (
  userId: string,
  data: Omit<typeof UserResumeTable.$inferInsert, "userId">,
) => {
  await db
    .insert(UserResumeTable)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: UserResumeTable.userId,
      set: data,
    });

  revalidateUserResumeCache(userId);
};
