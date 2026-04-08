import { envServer } from "@/data/env/server";
import { JobListingTable } from "@/db/schema";
import {
  formatExperienceLevel,
  formatJobListingLocation,
  formatJobType,
  formatLocationRequirement,
  formatWage,
} from "@/features/job-listings/lib/formatters";
import { createAgent, gemini } from "@inngest/agent-kit";
import { getLastOutputMessage } from "./get-last-output-message";

const NO_JOBS = "NO_JOBS";

export type MatchingJobListing = Pick<
  typeof JobListingTable.$inferSelect,
  | "id"
  | "title"
  | "description"
  | "wage"
  | "wageInterval"
  | "stateAbbreviation"
  | "city"
  | "locationRequirement"
  | "experienceLevel"
  | "type"
> & {
  postedAt?: typeof JobListingTable.$inferSelect.postedAt;
  organizationName?: string | null;
};

export const getMatchingJobListings = async ({
  prompt,
  jobListings,
  maxNumberOfJobs,
}: {
  prompt: string;
  jobListings: MatchingJobListing[];
  maxNumberOfJobs?: number;
}) => {
  if (jobListings.length === 0) return [];

  const agent = createAgent({
    name: "Job Matching Agent",
    description:
      "Agent that ranks a provided set of job listings against a user's search query and returns the best matching job listing IDs.",
    system: `You are an expert job matching agent.

You are not searching a database and you do not have access to tools. Instead, you are given a fixed catalog of already-fetched published job listings directly inside this system prompt. Your task is to read the user's natural-language search request, compare it against the provided job listings, and return the IDs of the listings that are the best matches.

Required final output:
- Your final response must be only a comma separated string of the best matching job listing IDs.
- The exact format must be: jobListingId, jobListingId, jobListingId
- Do not return markdown, bullets, JSON, explanations, labels, or any other text.
- ONLY IF YOU CANNOT FIND ANY GOOD MATCHES: return "${NO_JOBS}"

Result limit:
- maxNumberOfJobs is ${maxNumberOfJobs ?? "not provided"}.
- If maxNumberOfJobs is provided, do not return more than ${maxNumberOfJobs} job listing IDs.
- If maxNumberOfJobs is not provided, return however many job listing IDs you judge appropriate.

How to evaluate matches:
- Only choose from the provided job listings.
- Never invent a job listing ID.
- Prefer the listings that best match the user's true intent, not just the listings with the most keyword overlap.
- Consider role title, responsibilities, technologies, domain, seniority, job type, location, compensation, and any other explicit preferences mentioned by the user.
- Use the description heavily when the user mentions skills, tools, industries, or responsibilities.
- Use the title heavily when the user names a role directly.
- Use compensation only when the user clearly cares about it.
- Use postedAt only if it is available in the provided listing text and relevant to the user's request.
- If the user is broad, return the strongest broad matches.
- If the user is specific, prioritize must-have criteria and do not include weak matches just to fill space.
- If a listing conflicts with a clear user requirement, do not return it unless the overall fit is still unusually strong and the conflict is minor.

How to use the provided catalog:
- Each listing includes a job ID and human-readable fields.
- Read the listings carefully and compare them against the user's request.
- Make the most of the provided information.
- You cannot ask for more data and you cannot perform another search.
- Your job is to rank and select from the provided set only.

Available job listings:
${formatJobListingsForPrompt(jobListings)}`,
    model: gemini({
      model: "gemini-2.5-flash",
      apiKey: envServer.GEMINI_API_KEY,
    }),
  });

  const result = await agent.run(`User job search query prompt: ${prompt}`, {
    maxIter: 1,
  });

  const lastMessage = getLastOutputMessage(result);
  if (!lastMessage || lastMessage === NO_JOBS) return [];

  const matchingIds = lastMessage
    .split(",")
    .map((jobId) => jobId.trim())
    .filter(Boolean);

  return maxNumberOfJobs == null
    ? matchingIds
    : matchingIds.slice(0, maxNumberOfJobs);
};

const formatJobListingsForPrompt = (jobListings: MatchingJobListing[]) => {
  return jobListings
    .map((jobListing, index) => {
      const location = formatJobListingLocation({
        city: jobListing.city,
        stateAbbreviation: jobListing.stateAbbreviation,
      });

      const compensation =
        jobListing.wage != null && jobListing.wageInterval != null
          ? formatWage(jobListing.wage, jobListing.wageInterval)
          : "Not specified";

      return [
        `Job ${index + 1}`,
        `ID: ${jobListing.id}`,
        `Title: ${jobListing.title}`,
        `Organization: ${jobListing.organizationName ?? "Not specified"}`,
        `Location: ${location}`,
        `Location Requirement: ${formatLocationRequirement(jobListing.locationRequirement)}`,
        `Experience Level: ${formatExperienceLevel(jobListing.experienceLevel)}`,
        `Employment Type: ${formatJobType(jobListing.type)}`,
        `Compensation: ${compensation}`,
        `Posted At: ${formatPostedAt(jobListing.postedAt)}`,
        `Description: ${normalizeText(jobListing.description)}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");
};

const formatPostedAt = (postedAt: MatchingJobListing["postedAt"]) => {
  if (postedAt == null) return "Not specified";

  return postedAt instanceof Date
    ? postedAt.toISOString()
    : String(postedAt);
};

const normalizeText = (text: string) => {
  return text.replace(/\s+/g, " ").trim();
};
