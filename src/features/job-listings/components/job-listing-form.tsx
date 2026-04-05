"use client";

import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { jobListingSchema, JobListingSchemaType } from "../actions/schemas";
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
  formatWageInterval,
} from "../lib/formatters";
import { StateSelectItems } from "./state-select-items";
import { createJobListing } from "../actions/actions";
import { toast } from "sonner";

const NONE_SELECT_VALUE = "None";

export const JobListingForm = () => {
  const form = useForm({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      title: "",
      description: "",
      stateAbbreviation: null,
      city: null,
      wage: null,
      wageInterval: "yearly",
      experienceLevel: "junior",
      type: "full-time",
      locationRequirement: "in-office",
    },
  });

  const onSubmit = async (data: JobListingSchemaType) => {
    const response = await createJobListing(data);
    if (response.error) {
      toast.error(response.message);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 @container"
    >
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Job Title</FieldLabel>
              <Input {...field} />
              {fieldState?.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="wage"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Wage</FieldLabel>
              <div className="flex">
                <Input
                  {...field}
                  type="number"
                  value={field.value ?? ""}
                  className="min-w-0 flex-1 rounded-r-none"
                  onChange={(e) =>
                    field.onChange(
                      isNaN(e.target.valueAsNumber)
                        ? null
                        : e.target.valueAsNumber,
                    )
                  }
                />
                <Controller
                  name="wageInterval"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(val) => field.onChange(val ?? null)}
                    >
                      <SelectTrigger className="w-fit shrink-0 rounded-l-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wageIntervals.map((interval) => (
                          <SelectItem key={interval} value={interval}>
                            {formatWageInterval(interval)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <FieldDescription>Optional</FieldDescription>
              {fieldState?.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
        <div className="grid grid-cols-1 @xs:grid-cols-2 gap-x-2 gap-y-6 items-start">
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>City</FieldLabel>
                <Input {...field} value={field.value ?? ""} />
                {fieldState?.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="stateAbbreviation"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>State</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) =>
                    field.onChange(val === NONE_SELECT_VALUE ? null : val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.value !== null && (
                      <SelectItem
                        value={NONE_SELECT_VALUE}
                        className="text-muted-foreground"
                      >
                        Clear
                      </SelectItem>
                    )}

                    <StateSelectItems />
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="locationRequirement"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Location Requirement</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationRequirements.map((requirement) => (
                    <SelectItem key={requirement} value={requirement}>
                      {formatLocationRequirement(requirement)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Job Type</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobListingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatJobType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="experienceLevel"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Experience Level</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {formatExperienceLevel(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Description</FieldLabel>
            <MarkdownEditor {...field} markdown={field.value} />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button
        disabled={form.formState.isSubmitting}
        type="submit"
        className="w-full"
      >
        <LoadingSwap isLoading={form.formState.isSubmitting}>
          Create Job Listing
        </LoadingSwap>
      </Button>
    </form>
  );
};
