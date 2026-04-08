"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  jobListingAiSearchSchema,
  JobListingAiSearchSchemaType,
} from "../actions/schemas";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { toast } from "sonner";
import { getAiJobListingSearchResults } from "../actions/actions";
import { useRouter } from "next/navigation";

export const JobListingAiSearchForm = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(jobListingAiSearchSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit = async (data: JobListingAiSearchSchemaType) => {
    const results = await getAiJobListingSearchResults(data);
    if (results.error) {
      toast.error(results.message);
      return;
    }

    const params = new URLSearchParams();
    results.jobIds.forEach((id) => params.append("jobIds", id));
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="query"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Query</FieldLabel>
            <Textarea {...field} className="min-h-32" />
            <FieldDescription>
              Provide a description of your skills/experience as well as what
              you are looking for in a job. The more specific you are, the
              better the results will be.
            </FieldDescription>
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
          Search
        </LoadingSwap>
      </Button>
    </form>
  );
};
