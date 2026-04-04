"use client";

import { SignInStatus } from "@/services/clerk/components/sign-in-status";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export const SidebarNavMenuGroup = ({
  items,
  className,
}: {
  items: {
    href: string;
    icon: ReactNode;
    label: string;
    authStatus?: "signed-in" | "signed-out";
  }[];
  className?: string;
}) => {
  const pathname = usePathname();

  return (
    <SidebarGroup className={className}>
      <SidebarMenu>
        {items.map((item) => {
          const html = (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
          if (item.authStatus) {
            return <SignInStatus when={item.authStatus}>{html}</SignInStatus>;
          }
          return html;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};
