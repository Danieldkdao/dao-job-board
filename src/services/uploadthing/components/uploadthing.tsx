"use client";

import { generateUploadDropzone } from "@uploadthing/react";
import { CustomFileRouter } from "../router";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";
import { Json } from "@uploadthing/shared";

const UploadDropzoneComponent = generateUploadDropzone<CustomFileRouter>();

export const UploadDropzone = ({
  className,
  onClientUploadComplete,
  onUploadError,
  ...props
}: ComponentProps<typeof UploadDropzoneComponent>) => {
  return (
    <UploadDropzoneComponent
      className={cn(
        "border-2 border-muted rounded-lg flex items-center justify-center",
        className,
      )}
      {...props}
      onClientUploadComplete={(res) => {
        res.forEach(({ serverData }) => {
          toast.success(serverData.message);
        });
        onClientUploadComplete?.(res);
      }}
      onUploadError={(error: UploadThingError<Json>) => {
        toast.error(error.message);
        onUploadError?.(error);
      }}
    />
  );
};
