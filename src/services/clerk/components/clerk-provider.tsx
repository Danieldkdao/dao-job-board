"use client";

import { ReactNode, Suspense } from "react";
import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export const ClerkProvider = ({ children }: { children: ReactNode }) => {
  const { resolvedTheme } = useTheme();

  return (
    <Suspense>
      <OriginalClerkProvider
        appearance={
          resolvedTheme === "dark" ? { baseTheme: [dark] } : undefined
        }
      >
        {children}
      </OriginalClerkProvider>
    </Suspense>
  );
};
