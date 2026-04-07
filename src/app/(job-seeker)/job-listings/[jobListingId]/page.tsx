import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { JobListingItems } from "../../_shared/job-listing-items";
import { IsBreakpoint } from "@/components/is-breakpoint";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ClientSheet } from "./_client-sheet";
import { cacheTag } from "next/cache";
import { getJobListingIdTag } from "@/features/job-listings/db/cache/job-listings";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/db/schema";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organization";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { JobListingBadges } from "@/features/job-listings/components/job-listing-badges";
import { convertSearchParamsToString } from "@/lib/convert-search-params-to-string";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import Link from "next/link";

type JobListingsIdProps = {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

const JobListingsIdPage = (props: JobListingsIdProps) => {
  return (
    <ResizablePanelGroup autoSave="job-board-panel" orientation="horizontal">
      <ResizablePanel id="left" defaultSize="60%" minSize="30%">
        <div className="p-4 h-screen overflow-y-auto">
          <JobListingItems {...props} />
        </div>
      </ResizablePanel>
      <IsBreakpoint
        breakpoint="min-width: 1024px"
        otherwise={
          <ClientSheet>
            <SheetContent
              showCloseButton={false}
              className="p-4 overflow-y-auto"
            >
              <SheetHeader className="sr-only">
                <SheetTitle className="sr-only">Job Listing Details</SheetTitle>
              </SheetHeader>
              <Suspense fallback={<LoadingSpinner />}>
                <JobListingDetails {...props} />
              </Suspense>
            </SheetContent>
          </ClientSheet>
        }
      >
        <ResizableHandle withHandle className="mx-2" />
        <ResizablePanel id="right" defaultSize="40%" minSize="30%">
          <div className="p-4 h-screen overflow-y-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <JobListingDetails {...props} />
            </Suspense>
          </div>
        </ResizablePanel>
      </IsBreakpoint>
    </ResizablePanelGroup>
  );
};

const JobListingDetails = async ({
  params,
  searchParams,
}: JobListingsIdProps) => {
  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId);
  if (!jobListing) return notFound();

  const nameInitials = jobListing.organization.name
    .split(" ")
    .splice(0, 4)
    .map((word) => word[0])
    .join("");

  return (
    <div className="space-y-6 @container">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="size-14 @max-md:hidden">
            <AvatarImage
              src={jobListing.organization.imageUrl ?? undefined}
              alt={jobListing.organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {jobListing.title}
            </h1>
            <div className="text-base text-muted-foreground">
              {jobListing.organization.name}
            </div>
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @min-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @max-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
            <Button size="icon" variant="outline" asChild>
              <Link
                href={`/?${convertSearchParamsToString(await searchParams)}`}
              >
                <span className="sr-only">Close</span>
                <XIcon />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <JobListingBadges jobListing={jobListing} />
        </div>
        {/* <Suspense fallback={<Button disabled>Apply</Button>}>
          <ApplyButton jobListingId={jobListing.id} />
        </Suspense> */}
      </div>

      <MarkdownRenderer source={jobListing.description} className="prose-sm" />
    </div>
  );
};

export default JobListingsIdPage;

const getJobListing = async (jobListingId: string) => {
  "use cache";
  cacheTag(getJobListingIdTag(jobListingId));

  const listing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.status, "published"),
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  if (listing) {
    cacheTag(getOrganizationIdTag(listing.organizationId));
  }

  return listing;
};
