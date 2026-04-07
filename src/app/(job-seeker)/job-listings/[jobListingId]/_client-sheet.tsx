"use client";

import { Sheet } from "@/components/ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";

export const ClientSheet = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const searchParams = useSearchParams();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) return;
        setIsOpen(false);

        router.push(`/?${searchParams.toString()}`);
      }}
      modal
    >
      {children}
    </Sheet>
  );
};
