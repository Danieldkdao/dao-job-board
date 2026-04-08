"use client";

import { UploadDropzone } from "@/services/uploadthing/components/uploadthing";
import { useRouter } from "next/navigation";

export const DropzoneClient = () => {
  const router = useRouter();
  return (
    <UploadDropzone
      endpoint="resumeUploader"
      onClientUploadComplete={() => router.refresh()}
    />
  );
};
