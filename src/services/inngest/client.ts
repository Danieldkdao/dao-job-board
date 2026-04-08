import { JobListingTable } from "@/db/schema";
import { UserJSON, DeletedObjectJSON } from "@clerk/nextjs/server";
import { OrganizationJSON } from "@clerk/nextjs/types";
import { eventType, Inngest, staticSchema } from "inngest";

type ClerkWebhookData<T> = {
  data: T;
  raw: string;
  headers: Record<string, string>;
};

type Events = {
  "clerk/user.created": ClerkWebhookData<UserJSON>;
  "clerk/user.updated": ClerkWebhookData<UserJSON>;
  "clerk/user.deleted": ClerkWebhookData<DeletedObjectJSON>;
  "clerk/organization.created": ClerkWebhookData<OrganizationJSON>;
  "clerk/organization.updated": ClerkWebhookData<OrganizationJSON>;
  "clerk/organization.deleted": ClerkWebhookData<DeletedObjectJSON>;
  "app/job-listing-application.created": {
    jobListingId: string;
    userId: string;
  };
  "app/resume.uploaded": { user: { id: string } };
  "app/email.daily-user-job-listings": {
    user: {
      name: string;
      email: string;
    };
    data: {
      aiPrompt?: string;
      jobListings: (Omit<
        typeof JobListingTable.$inferSelect,
        "createdAt" | "postedAt" | "updatedAt" | "status" | "organizationId"
      > & { organizationName: string })[];
    };
  };
};

export const getEventSchema = <T extends keyof Events>(event: keyof Events) => {
  return eventType(event, {
    schema: staticSchema<Events[T]>(),
  });
};

export const inngest = new Inngest({
  id: "dao-jobs",
});
