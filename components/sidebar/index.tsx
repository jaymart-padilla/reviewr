'use client';

import { usePathname } from 'next/navigation';
import { LibraryBig } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Brand from '@/components/brand';
import { NavUser } from '@/components/sidebar/nav-user';
import { paths } from '@/lib/paths';
import Link from 'next/link';

interface AppSidebar extends React.ComponentProps<typeof Sidebar> {
  secondaryHeader?: React.ReactNode;
  bodyContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

export function AppSidebar({ secondaryHeader, bodyContent, footerContent, ...props }: AppSidebar) {
  const pathname = usePathname();
  const normalize = (p: string) => p.replace(/\/+$/, '');

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* first sidebar */}
      <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
        <SidebarHeader className="border-b md:border-b-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="md:h-8 md:p-0" size="lg" render={<Brand />} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="py-auto">
          <SidebarGroup className="gap-4 border-b px-4 py-2.5 md:gap-0 md:border-b-0 md:p-2">
            <SidebarGroupContent className="block md:hidden">{secondaryHeader}</SidebarGroupContent>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary/90 data-[active=true]:hover:text-primary-foreground px-2.5 data-[active=true]:font-medium md:px-2"
                    tooltip={{
                      children: paths.workspaces.text,
                      hidden: false,
                    }}
                    isActive={normalize(pathname) === normalize(paths.workspaces.url)}
                    render={<Link href={paths.workspaces.url} />}
                  >
                    <LibraryBig />
                    <span className="inline md:hidden">{paths.workspaces.text}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="flex min-h-0 flex-1 flex-col md:hidden">
            <SidebarGroupContent className="min-h-0 flex-1 overflow-y-auto">
              {bodyContent}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t md:border-t-0">
          <div className="block md:hidden">{footerContent}</div>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* second sidebar */}
      <Sidebar collapsible="none" className="hidden min-w-0 flex-1 md:flex">
        <SidebarHeader className="border-b p-4">{secondaryHeader}</SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>{bodyContent}</SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {footerContent && <SidebarFooter className="border-t">{footerContent}</SidebarFooter>}
      </Sidebar>
    </Sidebar>
  );
}
