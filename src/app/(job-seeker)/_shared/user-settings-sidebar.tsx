import { SidebarNavMenuGroup } from "@/components/sidebar/sidebar-nav-menu-group";
import { BellIcon, FileUserIcon } from "lucide-react";

export const UserSettingsSidebar = () => {
  return (
    <SidebarNavMenuGroup
      items={[
        {
          href: "/user-settings/notifications",
          icon: <BellIcon />,
          label: "Notifications",
        },
        {
          href: "/user-settings/resume",
          icon: <FileUserIcon />,
          label: "Resume",
        },
      ]}
    />
  );
};
