import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db/db";
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  OrganizationTable,
} from "@/db/schema";
import { convertSearchParamsToString } from "@/lib/convert-search-params-to-string";
import { cn } from "@/lib/utils";
import { and, desc, eq, ilike, inArray, or, SQL } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { differenceInDays } from "date-fns";
import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import { JobListingBadges } from "@/features/job-listings/components/job-listing-badges";
import z from "zod";
import { cacheTag } from "next/cache";
import { getJobListingGlobalTag } from "@/features/job-listings/db/cache/job-listings";

type JobListingItemsProps = {
  searchParams: Promise<Record<string, string | string[]>>;
  params?: Promise<{ jobListingId: string }>;
};

const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  state: z.string().optional().catch(undefined),
  experience: z.enum(experienceLevels).optional().catch(undefined),
  locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional()
    .catch([]),
});

export const JobListingItems = (props: JobListingItemsProps) => {
  return (
    <Suspense>
      <JobListingItemsSuspense {...props} />
    </Suspense>
  );
};

const JobListingItemsSuspense = async ({
  searchParams,
  params,
}: JobListingItemsProps) => {
  const jobListingId = params ? (await params).jobListingId : undefined;
  const { success, data } = searchParamsSchema.safeParse(await searchParams);
  const search = success ? data : {};

  const jobListings = await getJobListings(await searchParams, jobListingId);
  if (jobListings.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
    );
  }

  return (
    <div className="space-y-4">
      {jobListings.map((jl) => (
        <Link
          className="block"
          key={jl.id}
          href={`/job-listings/${jl.id}?${convertSearchParamsToString(search)}`}
        >
          <JobListingListItem jobListing={jl} organization={jl.organization} />
        </Link>
      ))}
    </div>
  );
};

const JobListingListItem = ({
  jobListing,
  organization,
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "title"
    | "stateAbbreviation"
    | "city"
    | "wage"
    | "wageInterval"
    | "experienceLevel"
    | "type"
    | "postedAt"
    | "locationRequirement"
    | "isFeatured"
  >;
  organization: Pick<
    typeof OrganizationTable.$inferSelect,
    "name" | "imageUrl"
  >;
}) => {
  const nameInitials = organization?.name
    .split(" ")
    .splice(0, 4)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <Card
      className={cn(
        "@container",
        jobListing.isFeatured && "border border-featured bg-featured/20",
      )}
    >
      <CardHeader>
        <div className="flex gap-4 items-start overflow-hidden">
          <div className="flex gap-4 min-w-0 flex-1">
            <Avatar className="size-14 shrink-0 @max-sm:hidden">
              <AvatarImage
                src={organization.imageUrl ?? undefined}
                alt={organization.name}
              />
              <AvatarFallback className="uppercase bg-primary text-primary-foreground">
                {nameInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
              <CardTitle className="truncate max-w-full text-xl">
                {jobListing.title}
              </CardTitle>
              <CardDescription className="text-base">
                {organization.name}
              </CardDescription>
              {jobListing.postedAt && (
                <div className="text-sm font-medium text-primary @min-md:hidden">
                  <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                    <DaysSincePosting postedAt={jobListing.postedAt} />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
          {jobListing.postedAt && (
            <div className="shrink-0 text-sm font-medium text-primary @max-md:hidden">
              <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                <DaysSincePosting postedAt={jobListing.postedAt} />
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? "border-primary/35" : undefined}
        />
      </CardContent>
    </Card>
  );
};

const DaysSincePosting = async ({ postedAt }: { postedAt: Date }) => {
  await connection();
  const daysSincePosted = differenceInDays(postedAt, Date.now());

  if (daysSincePosted === 0) {
    return <Badge>New</Badge>;
  }

  return new Intl.RelativeTimeFormat(undefined, {
    style: "narrow",
    numeric: "always",
  }).format(daysSincePosted, "days");
};

const getJobListings = async (
  searchParams: z.infer<typeof searchParamsSchema>,
  jobListingId?: string | undefined,
) => {
  "use cache";
  cacheTag(getJobListingGlobalTag());

  const whereConditions: (SQL | undefined)[] = [];
  if (searchParams.title) {
    whereConditions.push(
      ilike(JobListingTable.title, `%${searchParams.title}%`),
    );
  }
  if (searchParams.locationRequirement) {
    whereConditions.push(
      eq(JobListingTable.locationRequirement, searchParams.locationRequirement),
    );
  }
  if (searchParams.city) {
    whereConditions.push(ilike(JobListingTable.city, `%${searchParams.city}%`));
  }
  if (searchParams.state) {
    whereConditions.push(
      eq(JobListingTable.stateAbbreviation, searchParams.state),
    );
  }
  if (searchParams.experience) {
    whereConditions.push(
      eq(JobListingTable.experienceLevel, searchParams.experience),
    );
  }
  if (searchParams.type) {
    whereConditions.push(eq(JobListingTable.type, searchParams.type));
  }
  if (searchParams.jobIds) {
    whereConditions.push(inArray(JobListingTable, searchParams.jobIds));
  }

  return db.query.JobListingTable.findMany({
    where: or(
      jobListingId
        ? and(
            eq(JobListingTable.status, "published"),
            eq(JobListingTable.id, jobListingId),
          )
        : undefined,
      and(eq(JobListingTable.status, "published"), ...whereConditions),
    ),
    with: {
      organization: {
        columns: {
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)],
  });
};
