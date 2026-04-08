import { LoadingSpinner } from "@/components/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db/db";
import { UserNotificationSettingsTable } from "@/db/schema";
import { NotificationsForm } from "@/features/users/components/notifications-form";
import { getUserNotificationSettingsIdTag } from "@/features/users/db/cache/user-notification-settings";
import { getCurrentUser } from "@/services/clerk/lib/get-current-auth";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const NotificationsPage = () => {
  return (
    <Suspense>
      <NotificationsSuspense />
    </Suspense>
  );
};

const NotificationsSuspense = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <NotificationsFormSuspense userId={userId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

const NotificationsFormSuspense = async ({ userId }: { userId: string }) => {
  const notificationSettings = await getNotificationSettings(userId);
  return <NotificationsForm notificationSettings={notificationSettings} />;
};

const getNotificationSettings = async (userId: string) => {
  "use cache";
  cacheTag(getUserNotificationSettingsIdTag(userId));

  return db.query.UserNotificationSettingsTable.findFirst({
    where: eq(UserNotificationSettingsTable.userId, userId),
  });
};

export default NotificationsPage;
