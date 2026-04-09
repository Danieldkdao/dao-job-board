"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ReactNode } from "react";
import { ThemeToggle } from "../theme-toggle";

export const AppSidebarClient = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col w-full">
        <div className="p-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-1">
            <SidebarTrigger />
            <span className="text-xl">DAO Jobs</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex-1 flex">{children}</div>
      </div>
    );
  }

  return children;
};
