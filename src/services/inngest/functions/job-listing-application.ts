import { db } from "@/db/db";
import { getEventSchema, inngest } from "../client";
import { and, eq } from "drizzle-orm";
import {
  JobListingApplicationTable,
  JobListingTable,
  UserResumeTable,
} from "@/db/schema";
import { applicantRankingAgent } from "../ai/applicant-ranking-agent";

export const rankApplicant = inngest.createFunction(
  {
    id: "rank-applicant",
    name: "Rank Applicant",
    triggers: [
      getEventSchema<"app/job-listing-application.created">(
        "app/job-listing-application.created",
      ),
    ],
  },
  async ({ event, step }) => {
    const { userId, jobListingId } = event.data;

    const getCoverLetter = step.run("get-cover-letter", async () => {
      return await db.query.JobListingApplicationTable.findFirst({
        where: and(
          eq(JobListingApplicationTable.userId, userId),
          eq(JobListingApplicationTable.jobListingId, jobListingId),
        ),
        columns: {
          coverLetter: true,
        },
      });
    });

    const getResume = step.run("get-resume", async () => {
      return await db.query.UserResumeTable.findFirst({
        where: eq(UserResumeTable.userId, userId),
        columns: { aiSummary: true },
      });
    });

    const getJobListing = step.run("get-job-listing", async () => {
      return await db.query.JobListingTable.findFirst({
        where: eq(JobListingTable.id, jobListingId),
        columns: {
          id: true,
          city: true,
          description: true,
          experienceLevel: true,
          locationRequirement: true,
          stateAbbreviation: true,
          title: true,
          wage: true,
          wageInterval: true,
        },
      });
    });

    const [coverLetter, resumeSummary, jobListing] = await Promise.all([
      getCoverLetter,
      getResume,
      getJobListing,
    ]);

    if (!resumeSummary || !jobListing) return;

    await applicantRankingAgent.run(
      JSON.stringify({ coverLetter, resumeSummary, jobListingId, userId }),
    );
  },
);
