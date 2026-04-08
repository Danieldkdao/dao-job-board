import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Suspense } from "react";
import { DropzoneClient } from "./_dropzone-client";
import { getCurrentUser } from "@/services/clerk/lib/get-current-auth";
import { cacheTag } from "next/cache";
import { getUserResumeIdTag } from "@/features/users/db/cache/user-resumes";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/db/schema";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ResumePage = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold">Upload Your Resume</h1>
      <Card>
        <CardContent>
          <DropzoneClient />
        </CardContent>
        <Suspense>
          <ResumeDetails />
        </Suspense>
      </Card>
      <Suspense>
        <AISummaryCard />
      </Suspense>
    </div>
  );
};

const ResumeDetails = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) return notFound();

  const userResume = await getUserResume(userId);
  if (!userResume) return null;

  return (
    <CardFooter>
      <Button asChild>
        <Link
          href={userResume.resumeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Resume
        </Link>
      </Button>
    </CardFooter>
  );
};

const AISummaryCard = async () => {
  return null;
};

export default ResumePage;

const getUserResume = async (userId: string) => {
  "use cache";
  cacheTag(getUserResumeIdTag(userId));

  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
  });
};
