import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "../clerk/lib/get-current-auth";
import { inngest } from "../inngest/client";
import { upsertUserResume } from "@/features/users/db/user-resumes";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/db/schema";
import { uploadthing } from "./client";

const f = createUploadthing();

export const customFileRouter = {
  resumeUploader: f(
    {
      pdf: {
        maxFileSize: "8MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: true },
  )
    .middleware(async () => {
      const { userId } = await getCurrentUser();
      if (!userId) throw new UploadThingError("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId } = metadata;
      const resumeFileKey = await getUserResumeFileKey(userId);

      await upsertUserResume(userId, {
        resumeFileUrl: file.ufsUrl,
        resumeFileKey: file.key,
      });

      if (resumeFileKey) {
        await uploadthing.deleteFiles(resumeFileKey);
      }

      await inngest.send({
        name: "app/resume.uploaded",
        data: {
          user: {
            id: userId,
          },
        },
      });

      return { message: "Resume uploaded successfully!" };
    }),
} satisfies FileRouter;

export type CustomFileRouter = typeof customFileRouter;

const getUserResumeFileKey = async (userId: string) => {
  const data = await db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: {
      resumeFileKey: true,
    },
  });

  return data?.resumeFileKey;
};
