import { AsyncIf } from "@/components/async-if";
import { MarkdownPartial } from "@/components/markdown/markdown-partial";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { db } from "@/db/db";
import { JobListingStatus, JobListingTable } from "@/db/schema";
import {
  deleteJobListing,
  toggleJobListingFeatured,
  toggleJobListingStatus,
} from "@/features/job-listings/actions/actions";
import { JobListingBadges } from "@/features/job-listings/components/job-listing-badges";
import { getJobListingIdTag } from "@/features/job-listings/db/cache/job-listings";
import { formatJobListingStatus } from "@/features/job-listings/lib/formatters";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "@/features/job-listings/lib/plan-feature-helpers";
import { getNextJobListingStatus } from "@/features/job-listings/lib/utils";
import { getCurrentOrganization } from "@/services/clerk/lib/get-current-auth";
import { hasOrgUserPermission } from "@/services/clerk/lib/org-user-permissions";
import { and, eq } from "drizzle-orm";
import {
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  StarIcon,
  StarOffIcon,
  Trash2Icon,
} from "lucide-react";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";

type JobListingProps = {
  params: Promise<{ jobListingId: string }>;
};

const JobListingIdPage = (props: JobListingProps) => {
  return (
    <Suspense>
      <JobListingIdSuspense {...props} />
    </Suspense>
  );
};

const JobListingIdSuspense = async ({ params }: JobListingProps) => {
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return null;

  const { jobListingId } = await params;
  const jobListing = await getJobListing({ jobListingId, orgId });
  if (!jobListing) return notFound();

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>
        <div className="flex items-center gap-2 empty:-mt-4">
          <AsyncIf
            condition={() => hasOrgUserPermission("org:job_listings:update")}
          >
            <Button asChild variant="outline">
              <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
                <EditIcon className="size-4" />
                Edit
              </Link>
            </Button>
          </AsyncIf>
          <StatusUpdateButton status={jobListing.status} id={jobListing.id} />
          {jobListing.status === "published" && (
            <FeaturedToggleButton
              id={jobListing.id}
              isFeatured={jobListing.isFeatured}
            />
          )}
          <AsyncIf
            condition={() => hasOrgUserPermission("org:job_listings:delete")}
          >
            <ActionButton
              variant="destructive"
              action={deleteJobListing.bind(null, jobListing.id)}
              requireAreYouSure
              areYouSureDescription="This action will cause a permanent loss of data and cannot be undone."
            >
              <Trash2Icon className="size-4" />
              Delete
            </ActionButton>
          </AsyncIf>
        </div>
      </div>
      <MarkdownPartial
        dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
        mainMarkdown={<MarkdownRenderer source={jobListing.description} />}
        dialogTitle="Description"
      />
    </div>
  );
};

export default JobListingIdPage;

const UpgradePopover = ({
  buttonText,
  popoverText,
}: {
  buttonText: ReactNode;
  popoverText: ReactNode;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-2">
        {popoverText}
        <Button asChild>
          <Link href="/employer/pricing">Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

const StatusUpdateButton = ({
  status,
  id,
}: {
  status: JobListingStatus;
  id: string;
}) => {
  const button = (
    <ActionButton
      action={toggleJobListingStatus.bind(null, id)}
      variant="outline"
      requireAreYouSure={getNextJobListingStatus(status) === "published"}
      areYouSureDescription="This will immediately show this job listing to all users."
    >
      {statusToggleButtonText(status)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("org:job_listings:change_status")}
    >
      {getNextJobListingStatus(status) === "published" ? (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxPublishedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={statusToggleButtonText(status)}
              popoverText="You must upgrade your plan to publish more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      ) : (
        button
      )}
    </AsyncIf>
  );
};

const FeaturedToggleButton = ({
  isFeatured,
  id,
}: {
  isFeatured: boolean;
  id: string;
}) => {
  const button = (
    <ActionButton
      action={toggleJobListingFeatured.bind(null, id)}
      variant="outline"
    >
      {featuredToggleButtonText(isFeatured)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("org:job_listings:change_status")}
    >
      {isFeatured ? (
        button
      ) : (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={featuredToggleButtonText(isFeatured)}
              popoverText="You must upgrade your plan to feature more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      )}
    </AsyncIf>
  );
};

const statusToggleButtonText = (status: JobListingStatus) => {
  switch (status) {
    case "delisted":
    case "draft":
      return (
        <>
          <EyeIcon className="size-4" />
          Publish
        </>
      );
    case "published":
      return (
        <>
          <EyeOffIcon className="size-4" />
          Delist
        </>
      );
    default:
      throw new Error(`Unknown status: ${status satisfies never}`);
  }
};

const featuredToggleButtonText = (isFeatured: boolean) => {
  if (isFeatured) {
    return (
      <>
        <StarOffIcon className="size-4" />
        Unfeature
      </>
    );
  }
  return (
    <>
      <StarIcon className="size-4" />
      Feature
    </>
  );
};

const getJobListing = async ({
  jobListingId,
  orgId,
}: {
  jobListingId: string;
  orgId: string;
}) => {
  "use cache";
  cacheTag(getJobListingIdTag(jobListingId));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.organizationId, orgId),
    ),
  });
};
