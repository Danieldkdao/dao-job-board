"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { OrganizationUserSettingsTable } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  organizationUserSettingsSchema,
  OrganizationUserSettingsSchemaType,
} from "../actions/schemas";
import { RatingIcons } from "@/features/job-listing-applications/components/rating-icons";
import { RATING_OPTIONS } from "@/features/job-listing-applications/data/constants";
import { updateOrganizationUserSettings } from "../actions/organization-user-settings-action";

const ANY_VALUE = "any";

export const NotificationsForm = ({
  notificationSettings,
}: {
  notificationSettings?: Pick<
    typeof OrganizationUserSettingsTable.$inferSelect,
    "minimumRating" | "newApplicationEmailNotifications"
  >;
}) => {
  const form = useForm({
    resolver: zodResolver(organizationUserSettingsSchema),
    defaultValues: notificationSettings ?? {
      minimumRating: null,
      newApplicationEmailNotifications: false,
    },
  });

  const onSubmit = async (data: OrganizationUserSettingsSchemaType) => {
    const response = await updateOrganizationUserSettings(data);
    if (response.error) {
      toast.error(response.message);
      return;
    }
    toast.success(response.message);
  };

  const newApplicationEmailNotifications = form.watch(
    "newApplicationEmailNotifications",
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="border rounded-lg p-4 shadow-sm space-y-6">
        <Controller
          name="newApplicationEmailNotifications"
          control={form.control}
          render={({ field }) => (
            <Field>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FieldLabel>New Application Email Notifications</FieldLabel>
                  <FieldDescription>
                    Receive summary emails of all new job listing applications.
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
        {newApplicationEmailNotifications && (
          <Controller
            name="minimumRating"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Minimum Rating</FieldLabel>
                <Select
                  value={field.value ? field.value.toString() : ANY_VALUE}
                  onValueChange={(val) =>
                    field.onChange(val === ANY_VALUE ? null : parseInt(val))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_VALUE}>Any Rating</SelectItem>
                    {RATING_OPTIONS.filter((r) => r !== null).map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <RatingIcons className="text-inherit" rating={rating} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Only receive notifications for candidates that meet or exceed
                  this rating. Candidates 3-5 stars should meet all job
                  requirements and are likely a good fit for the role.
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
