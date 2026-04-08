import { inngest } from "@/services/inngest/client";
import {
  clerkCreateOrganization,
  clerkCreateUser,
  clerkDeleteOrganization,
  clerkDeleteUser,
  clerkUpdateOrganization,
  clerkUpdateUser,
} from "@/services/inngest/functions/clerk";
import {
  prepareDailyUserJobListingNotifications,
  sendDailyUserJobListingEmail,
} from "@/services/inngest/functions/email";
import { rankApplicant } from "@/services/inngest/functions/job-listing-application";
import { createAISummaryOfUploadResume } from "@/services/inngest/functions/resume";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkCreateUser,
    clerkUpdateUser,
    clerkDeleteUser,
    clerkCreateOrganization,
    clerkUpdateOrganization,
    clerkDeleteOrganization,
    createAISummaryOfUploadResume,
    rankApplicant,
    prepareDailyUserJobListingNotifications,
    sendDailyUserJobListingEmail,
  ],
});
