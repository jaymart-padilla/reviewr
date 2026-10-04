import { forwardRef, type SVGProps } from 'react';

export interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  bgColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

/**
 * Reusable brand/logo icon.
 *
 * Colors default to shadcn/ui theme tokens, so it automatically matches
 * app's theme (including dark mode) unless overridden:
 *
 *   <LogoIcon />                                   // themed default
 *   <LogoIcon size={32} />                         // bigger
 *   <LogoIcon bgColor="#2c493a" strokeColor="#d9c38d" /> // fixed brand colors
 *   <LogoIcon bgColor="hsl(var(--card))" />         // a different token
 */
export const LogoIcon = forwardRef<SVGSVGElement, LogoIconProps>(
  (
    {
      size = 24,
      bgColor = 'var(--primary)',
      strokeColor = 'var(--primary-foreground)',
      strokeWidth = 2.5,
      ...props
    },
    ref
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        aria-hidden={props['aria-label'] ? undefined : true}
        {...props}
      >
        <rect width="64" height="64" rx="14" fill={bgColor} />
        <g
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M32 21c-6-4-13-5-21-3v29c8-2 15-1 21 3 6-4 13-5 21-3V18c-8-2-15-1-21 3v29" />
          <path d="M18 26c3 0 5 1 8 2m-8 6c3 0 5 1 8 2m12-8c3-1 5-2 8-2m-8 10c3-1 5-2 8-2" />
        </g>
      </svg>
    );
  }
);

LogoIcon.displayName = 'LogoIcon';
