"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  userNotificationSettingsSchema,
  UserNotificationSettingsSchemaType,
} from "../actions/schemas";
import { UserNotificationSettingsTable } from "@/db/schema";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { updateUserNotificationSettings } from "../actions/user-notification-settings-action";
import { toast } from "sonner";

export const NotificationsForm = ({
  notificationSettings,
}: {
  notificationSettings?: Pick<
    typeof UserNotificationSettingsTable.$inferSelect,
    "aiPrompt" | "newJobEmailNotifications"
  >;
}) => {
  const form = useForm({
    resolver: zodResolver(userNotificationSettingsSchema),
    defaultValues: notificationSettings ?? {
      newJobEmailNotifications: false,
      aiPrompt: "",
    },
  });

  const onSubmit = async (data: UserNotificationSettingsSchemaType) => {
    const response = await updateUserNotificationSettings(data);
    if (response.error) {
      toast.error(response.message);
      return;
    }
    toast.success(response.message);
  };

  const newJobEmailNotifications = form.watch("newJobEmailNotifications");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="border rounded-lg p-4 shadow-sm space-y-6">
        <Controller
          name="newJobEmailNotifications"
          control={form.control}
          render={({ field }) => (
            <Field>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FieldLabel>Daily Email Notifications</FieldLabel>
                  <FieldDescription>
                    Receive emails about new job listings that match your
                    interests.
                  </FieldDescription>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            </Field>
          )}
        />
        {newJobEmailNotifications && (
          <Controller
            name="aiPrompt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <div className="space-y-0 5">
                  <FieldLabel>Filter Prompt</FieldLabel>
                  <FieldDescription>
                    Our AI will use this prompt to filter job listings and only
                    send you notifications for jobs that match your criteria.
                  </FieldDescription>
                </div>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  className="min-h-32"
                  placeholder="Describe the jobs you're interested in. For example: 'I'm looking for remote frontend developments positions that use React and pay at least $100k per year.'"
                />
                <FieldDescription>
                  Leave blank to receive notifications of all new job listings.
                </FieldDescription>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}
      </div>
      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full"
      >
        <LoadingSwap isLoading={form.formState.isSubmitting}>
          Save Notification Settings
        </LoadingSwap>
      </Button>
    </form>
  );
};
