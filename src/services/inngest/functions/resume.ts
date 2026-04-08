import { db } from "@/db/db";
import { getEventSchema, inngest } from "../client";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/db/schema";
import { generateText } from "ai";
import { updateUserResume } from "@/features/users/db/user-resumes";
import { google } from "@/services/ai/lib/models";

export const createAISummaryOfUploadResume = inngest.createFunction(
  {
    id: "create-ai-summary-of-uploaded-resume",
    name: "Create AI Summary of Uploaded Resume",
    triggers: [getEventSchema<"app/resume.uploaded">("app/resume.uploaded")],
  },
  async ({ event, step }) => {
    const { id: userId } = event.data.user;

    const userResume = await step.run("get-user-resume", async () => {
      return await db.query.UserResumeTable.findFirst({
        where: eq(UserResumeTable.userId, userId),
      });
    });

    if (!userResume) return;

    const resumePdfBase64 = await step.run("fetch-resume-pdf", async () => {
      const response = await fetch(userResume.resumeFileUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch uploaded resume PDF.");
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer).toString("base64");
    });

    const result = await step.ai.wrap("create-ai-summary", generateText, {
      model: google("gemini-2.5-flash-lite"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Summarize the following resume and extract all key skills, experience, and qualifications. The summary should include all the information that a hiring manager would need to know about the candidate in order to determine if they are a good fit for a job. This summary should be formatted as markdown. D not return any other text. If the file does not look like a resume return the text 'N/A'.",
            },
            {
              type: "file",
              data: resumePdfBase64,
              mediaType: "application/pdf",
            },
          ],
        },
      ],
    });

    await step.run("save-ai-summary", async () => {
      const message = result.text?.trim();
      if (!message) {
        throw new Error("AI summary was empty.");
      }

      await updateUserResume(userId, { aiSummary: message });
    });
  },
);
