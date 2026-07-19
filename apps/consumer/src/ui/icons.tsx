import type { ReactNode, SVGProps } from "react";

/**
 * Eventra Mobile — unified icon set.
 *
 * One consistent style across the whole app: 24×24 grid, `currentColor` stroke,
 * 1.8 weight, round caps/joins. Zero dependencies. Every icon takes an optional
 * `size`. This replaces the ad-hoc per-screen inline SVGs so iconography stays
 * coherent (a redesign requirement).
 */
export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 22, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) => (
  <Icon {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9.5h12V10" /><path d="M10 19.5v-5h4v5" /></Icon>
);
export const IconCalendar = (p: IconProps) => (
  <Icon {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.6" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></Icon>
);
export const IconTag = (p: IconProps) => (
  <Icon {...p}><path d="M3 12.5V4.7a1 1 0 0 1 1-1h7.8l8 8a1.5 1.5 0 0 1 0 2.12l-6 6a1.5 1.5 0 0 1-2.12 0Z" /><circle cx="7.4" cy="8.1" r="1.35" /></Icon>
);
export const IconBell = (p: IconProps) => (
  <Icon {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>
);
export const IconUser = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></Icon>
);
export const IconInbox = (p: IconProps) => (
  <Icon {...p}><path d="M3 13h5l2 3h4l2-3h5" /><path d="M5 5h14l2 8v6H3v-6Z" /></Icon>
);
export const IconSearch = (p: IconProps) => (
  <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></Icon>
);
export const IconSparkle = (p: IconProps) => (
  <Icon {...p}><path d="M12 3.5c.6 3.9 1.6 4.9 5.5 5.5-3.9.6-4.9 1.6-5.5 5.5-.6-3.9-1.6-4.9-5.5-5.5 3.9-.6 4.9-1.6 5.5-5.5Z" /><path d="M18.5 15c.3 1.8.7 2.2 2.5 2.5-1.8.3-2.2.7-2.5 2.5-.3-1.8-.7-2.2-2.5-2.5 1.8-.3 2.2-.7 2.5-2.5Z" /></Icon>
);
export const IconPin = (p: IconProps) => (
  <Icon {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></Icon>
);
export const IconHeart = (p: IconProps) => (
  <Icon {...p}><path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5c0 5.1-7 9.5-7 9.5Z" /></Icon>
);
export const IconHeartFill = (p: IconProps) => (
  <Icon {...p} fill="currentColor" stroke="none"><path d="M12 20.6S4 15.7 4 10.2A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8 3.6c0 5.5-8 10.4-8 10.4Z" /></Icon>
);
export const IconClock = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Icon>
);
export const IconTrend = (p: IconProps) => (
  <Icon {...p}><path d="M3.5 16.5 9 11l3.5 3.5L20.5 6.5" /><path d="M15.5 6.5h5v5" /></Icon>
);
export const IconTicket = (p: IconProps) => (
  <Icon {...p}><path d="M4 8.5A2 2 0 0 1 6 6.5h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M14 6.5v10" strokeDasharray="1.6 2.6" /></Icon>
);
export const IconChevronLeft = (p: IconProps) => (<Icon {...p}><path d="m14.5 6-6 6 6 6" /></Icon>);
export const IconChevronRight = (p: IconProps) => (<Icon {...p}><path d="m9.5 6 6 6-6 6" /></Icon>);
export const IconCheck = (p: IconProps) => (<Icon {...p}><path d="m5 12.5 4.5 4.5L19 7" /></Icon>);
export const IconClose = (p: IconProps) => (<Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>);
export const IconAlert = (p: IconProps) => (
  <Icon {...p}><path d="M12 3.5 21 19H3Z" /><path d="M12 10v4M12 17h.01" /></Icon>
);
export const IconWifiOff = (p: IconProps) => (
  <Icon {...p}><path d="M3 4l18 18" /><path d="M8.5 12.5a5 5 0 0 1 7 0M5 9a10 10 0 0 1 4-2.5M19 9a10 10 0 0 0-4.5-2.7" /><path d="M11 16a2 2 0 0 1 2 0" /></Icon>
);
export const IconDownload = (p: IconProps) => (
  <Icon {...p}><path d="M12 4v10m0 0 4-4m-4 4-4-4" /><path d="M5 19h14" /></Icon>
);
export const IconShare = (p: IconProps) => (
  <Icon {...p}><circle cx="6" cy="12" r="2.4" /><circle cx="17" cy="6" r="2.4" /><circle cx="17" cy="18" r="2.4" /><path d="m8.2 11 6.6-3.8M8.2 13l6.6 3.8" /></Icon>
);
export const IconExternal = (p: IconProps) => (
  <Icon {...p}><path d="M14 5h5v5" /><path d="M19 5 10 14" /><path d="M18 13.5V19H5V6h5.5" /></Icon>
);
export const IconShield = (p: IconProps) => (
  <Icon {...p}><path d="M12 3.5 19 6v5c0 4.5-3 7.5-7 9.5-4-2-7-5-7-9.5V6Z" /><path d="m9 12 2 2 4-4" /></Icon>
);
export const IconSettings = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M4.2 16.5l2.2-1.3M17.6 8.8l2.2-1.3" /></Icon>
);
