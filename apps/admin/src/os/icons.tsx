/**
 * Internal OS icon set — lightweight inline line-icons (stroke=currentColor),
 * zero external dependencies. One thin, consistent family for the whole console
 * (nav branches, topbar, states). Not copied from any icon library.
 */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden {...rest}
    >
      {children}
    </svg>
  );
}

/* ---- Navigation branch icons ---- */
export const IconHome = (p: P) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></Svg>;
export const IconCalendar = (p: P) => <Svg {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></Svg>;
export const IconMegaphone = (p: P) => <Svg {...p}><path d="M3 11v2a1 1 0 0 0 1 1h2l9 4V6L6 10H4a1 1 0 0 0-1 1Z" /><path d="M18 8.5a4 4 0 0 1 0 7" /></Svg>;
export const IconTag = (p: P) => <Svg {...p}><path d="M3 12.5V4.5a1 1 0 0 1 1-1h8l8.5 8.5a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0Z" /><circle cx="7.5" cy="8" r="1.3" /></Svg>;
export const IconContent = (p: P) => <Svg {...p}><path d="M6 3h8l5 5v13H6Z" /><path d="M14 3v5h5" /><path d="M9 13l2 2 4-4" /></Svg>;
export const IconChecklist = (p: P) => <Svg {...p}><path d="M4 6h2l1 1 2-2M4 12h2l1 1 2-2M4 18h2l1 1 2-2" /><path d="M13 6h7M13 12h7M13 18h7" /></Svg>;
export const IconBarChart = (p: P) => <Svg {...p}><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7" y="12" width="3" height="5" rx="0.5" /><rect x="12.5" y="8" width="3" height="9" rx="0.5" /><rect x="18" y="14" width="3" height="3" rx="0.5" /></Svg>;
export const IconUsers = (p: P) => <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1" /><path d="M17 14.5a5.5 5.5 0 0 1 3.5 5.5" /></Svg>;
export const IconLayout = (p: P) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 9h18M9 9v11" /></Svg>;
export const IconImage = (p: P) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="m4 18 5-5 4 4 3-3 4 4" /></Svg>;
export const IconNodes = (p: P) => <Svg {...p}><circle cx="5.5" cy="6" r="2.2" /><circle cx="18.5" cy="6" r="2.2" /><circle cx="12" cy="18" r="2.2" /><path d="M7.5 7.3 10.5 16M16.5 7.3 13.5 16M7.7 6h8.6" /></Svg>;
export const IconGear = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></Svg>;
export const IconCard = (p: P) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 9.5h18M6.5 15h4" /></Svg>;
export const IconGroup = (p: P) => <Svg {...p}><circle cx="12" cy="7.5" r="3" /><circle cx="5.5" cy="10" r="2.2" /><circle cx="18.5" cy="10" r="2.2" /><path d="M6.5 20a5.5 5.5 0 0 1 11 0M2.5 19.5a4 4 0 0 1 3-4M21.5 19.5a4 4 0 0 0-3-4" /></Svg>;
export const IconSliders = (p: P) => <Svg {...p}><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h13M21 18h-1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="19" cy="18" r="2" /></Svg>;
export const IconHash = (p: P) => <Svg {...p}><path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" /></Svg>;
export const IconWorkflow = (p: P) => <Svg {...p}><rect x="3" y="4" width="6" height="5" rx="1.5" /><rect x="15" y="15" width="6" height="5" rx="1.5" /><path d="M6 9v4a3 3 0 0 0 3 3h6" /></Svg>;
export const IconWallet = (p: P) => <Svg {...p}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="17" cy="14.5" r="1.3" /></Svg>;

/* ---- Topbar / utility icons ---- */
export const IconMenu = (p: P) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
export const IconSearch = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></Svg>;
export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const IconBell = (p: P) => <Svg {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></Svg>;
export const IconHelp = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.7-2.5 2-2.5 3.5" /><path d="M12 17.5h.01" /></Svg>;
export const IconChevronDown = (p: P) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>;
export const IconChevronLeft = (p: P) => <Svg {...p}><path d="m14 6-6 6 6 6" /></Svg>;
export const IconChevronRight = (p: P) => <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>;
export const IconFilter = (p: P) => <Svg {...p}><path d="M3 5h18l-7 8v5l-4 2v-7Z" /></Svg>;
export const IconTrendUp = (p: P) => <Svg {...p}><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></Svg>;
export const IconTrendDown = (p: P) => <Svg {...p}><path d="m3 7 6 6 4-4 8 8" /><path d="M15 17h6v-6" /></Svg>;
export const IconAlert = (p: P) => <Svg {...p}><path d="M12 3 2 20h20Z" /><path d="M12 9v5M12 17.5h.01" /></Svg>;
export const IconActivity = (p: P) => <Svg {...p}><path d="M3 12h4l2 6 4-14 2 8h6" /></Svg>;
export const IconInbox = (p: P) => <Svg {...p}><path d="M3 13h5l2 3h4l2-3h5" /><path d="M5 5h14l2 8v6H3v-6Z" /></Svg>;
export const IconPlug = (p: P) => <Svg {...p}><path d="M9 3v6M15 3v6" /><path d="M7 9h10v3a5 5 0 0 1-10 0Z" /><path d="M12 17v4" /></Svg>;
export const IconClock = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const IconCheck = (p: P) => <Svg {...p}><path d="m4 12 5 5L20 6" /></Svg>;
export const IconCode = (p: P) => <Svg {...p}><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" /></Svg>;
export const IconExternal = (p: P) => <Svg {...p}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Svg>;
