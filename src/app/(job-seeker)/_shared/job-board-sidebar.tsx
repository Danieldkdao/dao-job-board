import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { JobListingFilterForm } from "@/features/job-listings/components/job-listing-filter-form";

export const JobBoardSidebar = () => {
  return (
    <SidebarGroup className="group-data-[state=collapsed]:hidden">
      <SidebarGroupContent className="px-1">
        <JobListingFilterForm />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
