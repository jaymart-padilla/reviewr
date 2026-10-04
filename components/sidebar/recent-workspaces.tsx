'use client';

import Link from 'next/link';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { paths } from '@/lib/paths';
import type { Tables } from '@/database.types';

export function RecentWorkspaces({
  recentWorkspaces,
}: {
  recentWorkspaces: Tables<'workspaces'>[];
}) {
  if (!recentWorkspaces.length) return null;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuSub>
          {recentWorkspaces.map((workspace) => (
            <SidebarMenuSubItem key={workspace.id}>
              <SidebarMenuSubButton
                render={
                  <Link href={`${paths.workspaces.url}/${workspace.id}`}>
                    <span>{workspace.title}</span>
                  </Link>
                }
              />
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </SidebarMenu>
    </SidebarGroup>
  );
}
