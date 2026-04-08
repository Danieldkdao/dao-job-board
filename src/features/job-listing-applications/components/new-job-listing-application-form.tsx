"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  newJobListingApplicationSchema,
  type NewJobListingApplicationSchemaType,
} from "../actions/schemas";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { createJobListingApplication } from "../actions/actions";
import { toast } from "sonner";

export const NewJobListingApplicationForm = ({
  jobListingId,
}: {
  jobListingId: string;
}) => {
  const form = useForm({
    resolver: zodResolver(newJobListingApplicationSchema),
    defaultValues: {
      coverLetter: "",
    },
  });

  const onSubmit = async (data: NewJobListingApplicationSchemaType) => {
    const response = await createJobListingApplication(jobListingId, data);
    if (response.error) {
      toast.error(response.message);
      return;
    }
    toast.success(response.message);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="coverLetter"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Cover Letter</FieldLabel>
            <MarkdownEditor {...field} markdown={field.value ?? ""} />
            <FieldDescription>Optional</FieldDescription>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button
        disabled={form.formState.isSubmitting}
        type="submit"
        className="w-full"
      >
        <LoadingSwap isLoading={form.formState.isSubmitting}>Apply</LoadingSwap>
      </Button>
    </form>
  );
};
