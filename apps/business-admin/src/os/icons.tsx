/** Zero-dependency inline icon set for the Business Admin (stroke-based, 20px default). */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...p }: IconProps) {
  return {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, ...p,
  };
}

export const IconHome = (p: IconProps) => (<svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>);
export const IconBuilding = (p: IconProps) => (<svg {...base(p)}><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h2M9 11h2M13 7h2M13 11h2M9 15h6v6H9z" /></svg>);
export const IconStore = (p: IconProps) => (<svg {...base(p)}><path d="M4 9h16l-1-5H5L4 9z" /><path d="M5 9v11h14V9" /><path d="M9 20v-5h6v5" /></svg>);
export const IconUsers = (p: IconProps) => (<svg {...base(p)}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5.5M21 20a6 6 0 0 0-4-5.6" /></svg>);
export const IconCart = (p: IconProps) => (<svg {...base(p)}><path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18h7.9a2 2 0 0 0 2-1.6L21 8H6" /><circle cx="10" cy="21" r="1" /><circle cx="17" cy="21" r="1" /></svg>);
export const IconChart = (p: IconProps) => (<svg {...base(p)}><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></svg>);
export const IconMegaphone = (p: IconProps) => (<svg {...base(p)}><path d="M3 11v2a1 1 0 0 0 1 1h2l7 4V6L6 10H4a1 1 0 0 0-1 1z" /><path d="M17 8a4 4 0 0 1 0 8" /></svg>);
export const IconCard = (p: IconProps) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></svg>);
export const IconPlug = (p: IconProps) => (<svg {...base(p)}><path d="M9 3v6M15 3v6" /><path d="M6 9h12v3a6 6 0 0 1-12 0V9z" /><path d="M12 18v3" /></svg>);
export const IconAlert = (p: IconProps) => (<svg {...base(p)}><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v5M12 18h.01" /></svg>);
export const IconLifebuoy = (p: IconProps) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" /><path d="m6 6 3.5 3.5M14.5 14.5 18 18M18 6l-3.5 3.5M9.5 14.5 6 18" /></svg>);
export const IconPulse = (p: IconProps) => (<svg {...base(p)}><path d="M3 12h4l2 6 4-14 2 8h6" /></svg>);
export const IconShield = (p: IconProps) => (<svg {...base(p)}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3z" /><path d="m9 12 2 2 4-4" /></svg>);
export const IconGear = (p: IconProps) => (<svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></svg>);
export const IconEye = (p: IconProps) => (<svg {...base(p)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>);
