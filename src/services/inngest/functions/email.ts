import { db } from "@/db/db";
import { getEventSchema, inngest } from "../client";
import { and, eq, gte } from "drizzle-orm";
import { JobListingTable, UserNotificationSettingsTable } from "@/db/schema";
import { subDays } from "date-fns";
import { getMatchingJobListings } from "../ai/get-matching-job-listings";
import { resend } from "@/services/resend/client";
import DailyJobListingEmail from "@/services/resend/components/daily-job-listing-email";
import { envServer } from "@/data/env/server";

export const prepareDailyUserJobListingNotifications = inngest.createFunction(
  {
    id: "prepare-daily-user-job-listing-notifications",
    name: "Prepare Daily User Job Listing Notifications",
    triggers: { cron: "TZ=America/Chicago 0 7 * * *" },
  },
  async ({ event, step }) => {
    const getUserNotifications = step.run("get-users", async () => {
      return await db.query.UserNotificationSettingsTable.findMany({
        where: eq(UserNotificationSettingsTable.newJobEmailNotifications, true),
        columns: {
          userId: true,
          newJobEmailNotifications: true,
          aiPrompt: true,
        },
        with: {
          user: {
            columns: {
              email: true,
              name: true,
            },
          },
        },
      });
    });

    const getJobListings = step.run("get-recent-job-listings", async () => {
      return await db.query.JobListingTable.findMany({
        where: and(
          gte(
            JobListingTable.postedAt,
            subDays(new Date(event.ts ?? Date.now()), 1),
          ),
          eq(JobListingTable.status, "published"),
        ),
        columns: {
          createdAt: false,
          postedAt: false,
          updatedAt: false,
          status: false,
          organizationId: false,
        },
        with: {
          organization: {
            columns: { name: true },
          },
        },
      });
    });

    const [userNotifications, jobListings] = await Promise.all([
      getUserNotifications,
      getJobListings,
    ]);

    if (userNotifications.length === 0 || jobListings.length === 0) return;

    const events = userNotifications.map((notification) => {
      return {
        name: "app/email.daily-user-job-listings",
        data: {
          user: {
            name: notification.user.name,
            email: notification.user.email,
          },
          data: {
            aiPrompt: notification.aiPrompt ?? undefined,
            jobListings: jobListings.map((jobListing) => ({
              ...jobListing,
              organizationName: jobListing.organization.name,
            })),
          },
        },
      } as const satisfies {
        name: "app/email.daily-user-job-listings";
        data: {
          user: {
            name: string | null;
            email: string;
          };
          data: {
            aiPrompt?: string;
            jobListings: (Omit<
              typeof JobListingTable.$inferSelect,
              | "createdAt"
              | "postedAt"
              | "updatedAt"
              | "status"
              | "organizationId"
            > & { organizationName: string })[];
          };
        };
      };
    });

    await step.sendEvent("send-emails", events);
  },
);

export const sendDailyUserJobListingEmail = inngest.createFunction(
  {
    id: "send-daily-user-job-listing-email",
    name: "Send Daily User Job Listing Email",
    throttle: {
      limit: 10,
      period: "1m",
    },
    triggers: [
      getEventSchema<"app/email.daily-user-job-listings">(
        "app/email.daily-user-job-listings",
      ),
    ],
  },
  async ({ event, step }) => {
    const { aiPrompt, jobListings } = event.data.data;
    const user = event.data.user;

    let matchingJobListings: typeof jobListings = [];
    if (!aiPrompt?.trim()) {
      matchingJobListings = jobListings;
    } else {
      const matchingIds = await getMatchingJobListings({
        prompt: `
        Prompt: ${aiPrompt}
        -------
        Info: Only choose from the provided daily job listings. These provided listings are already the recent daily listings for this email run.
        `,
        jobListings,
      });
      matchingJobListings = jobListings.filter((listing) =>
        matchingIds.includes(listing.id),
      );
    }

    if (matchingJobListings.length === 0) return;

    await step.run("send-email", async () => {
      await resend.emails.send({
        from: "Dao Jobs <onboarding@resend.dev>",
        to: user.email,
        subject: "Daily Job Listings",
        react: DailyJobListingEmail({
          jobListings: matchingJobListings,
          userName: user.name,
          serverUrl: envServer.SERVER_URL,
        }),
      });
    });
  },
);
