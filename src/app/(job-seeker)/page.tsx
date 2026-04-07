import { JobListingItems } from "./_shared/job-listing-items";

const HomePage = ({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
  params: Promise<{ jobListingId: string }>;
}) => {
  return (
    <div className="m-4">
      <JobListingItems searchParams={searchParams} params={params} />
    </div>
  );
};

export default HomePage;
