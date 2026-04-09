import { LoadingSpinner } from "@/components/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db/db";
import { OrganizationUserSettingsTable } from "@/db/schema";
import { NotificationsForm } from "@/features/organizations/components/notifications-form";
import { getOrganizationUserSettingsIdTag } from "@/features/organizations/db/cache/organization-user-settings";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/get-current-auth";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function EmployerUserSettingsPage() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

async function SuspendedComponent() {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  if (userId == null || orgId == null) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <SuspendedForm userId={userId} organizationId={orgId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const notificationSettings = await getNotificationSettings({
    userId,
    organizationId,
  });

  return <NotificationsForm notificationSettings={notificationSettings} />;
}

async function getNotificationSettings({
  organizationId,
  userId,
}: {
  userId: string;
  organizationId: string;
}) {
  "use cache";
  cacheTag(getOrganizationUserSettingsIdTag({ userId, organizationId }));

  return db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
      eq(OrganizationUserSettingsTable.userId, userId),
      eq(OrganizationUserSettingsTable.organizationId, organizationId),
    ),
    columns: {
      newApplicationEmailNotifications: true,
      minimumRating: true,
    },
  });
}
