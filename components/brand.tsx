import Link from 'next/link';
import { paths } from '@/lib/paths';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

type BrandProps = ComponentPropsWithoutRef<typeof Link>;

const Brand = forwardRef<HTMLAnchorElement, Omit<BrandProps, 'href'>>(function Brand(
  { className, ...props },
  forwardedRef
) {
  return (
    <Link
      ref={forwardedRef}
      className={cn(className, 'flex items-center gap-1')}
      href={paths.home.url}
      {...props}
    >
      <div className="text-primary dark:text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center">
        <BRAND.logo className="book-mobile:w-5" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <span className="book-mobile:text-xl text-2xl font-semibold tracking-tight lowercase">
        {BRAND.title}
        <span className="text-book-accent">.</span>
      </span>
    </Link>
  );
});

Brand.displayName = 'Brand';

export default Brand;
