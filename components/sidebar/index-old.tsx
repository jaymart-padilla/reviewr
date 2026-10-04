import * as React from 'react';

import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import Brand from '@/components/brand';
import { AppSidebarMenu } from '@/components/sidebar/menu';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  children?: React.ReactNode;
}

export function AppSidebarOld({ children, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Brand />} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <AppSidebarMenu />
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
