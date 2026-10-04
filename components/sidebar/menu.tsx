'use client';

import Link from 'next/link';
import { LibraryBig } from 'lucide-react';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { paths } from '@/lib/paths';

export function AppSidebarMenu() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <Link href={paths.workspaces.url}>
                <LibraryBig />
                <span className="group-data-[collapsible=icon]:hidden">
                  {paths.workspaces.text}
                </span>
              </Link>
            }
            tooltip={paths.workspaces.text}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
