import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface SidebarInsetContainerProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export function SidebarInsetContainer({
  title,
  subtitle,
  headerActions,
  children,
}: SidebarInsetContainerProps) {
  return (
    <SidebarInset className="min-w-0">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
        <div className="flex w-full items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <div className="flex w-full min-w-0 items-center justify-between">
            <div className="w-1/3 min-w-0 shrink-0">
              <h1 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {title}
              </h1>
              {subtitle && (
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
              )}
            </div>
            <div className="flex flex-1 items-center justify-end gap-4 sm:gap-8.5">
              {headerActions}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      {children}
    </SidebarInset>
  );
}
