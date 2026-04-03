import { UserJSON, DeletedObjectJSON } from "@clerk/nextjs/server";
import { EventType, eventType, Inngest, staticSchema } from "inngest";

type ClerkWebhookData<T> = {
  data: T;
  raw: string;
  headers: Record<string, string>;
};

type Events = {
  "clerk/user.created": ClerkWebhookData<UserJSON>;
  "clerk/user.updated": ClerkWebhookData<UserJSON>;
  "clerk/user.deleted": ClerkWebhookData<DeletedObjectJSON>;
};

export const getWebhookSchema = <T extends keyof Events>(
  event: keyof Events,
) => {
  return eventType(event, {
    schema: staticSchema<Events[T]>(),
  });
};

export const inngest = new Inngest({
  id: "dao-jobs",
});
