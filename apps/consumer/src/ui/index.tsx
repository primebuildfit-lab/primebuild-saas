import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { IconChevronRight, IconClose, type IconProps } from "./icons";

/**
 * Eventra Mobile — design-system primitives.
 *
 * Thin, typed React wrappers over the centralized `.em-*` stylesheet (theme.css).
 * Screens compose ONLY these — no ad-hoc inline styling, no duplicated markup.
 * The visual language (tokens, radii, motion, naming) mirrors the Eventra
 * Internal OS command-center, so Mobile reads as the same product family and can
 * serve as the reference for future ecosystem mobile apps.
 */

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Buttons ---------------- */
export function Button({
  variant = "primary",
  size = "md",
  block,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  block?: boolean;
}) {
  return (
    <button
      type="button"
      className={cx("em-btn", `em-btn-${variant}`, size === "sm" && "em-btn-sm", block && "em-btn-block", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconButton({
  label,
  plain,
  dot,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; plain?: boolean; dot?: boolean }) {
  return (
    <button type="button" aria-label={label} className={cx("em-iconbtn", plain && "em-iconbtn-plain", className)} {...rest}>
      {children}
      {dot ? <span className="em-dot" aria-hidden /> : null}
    </button>
  );
}

/* ---------------- Chips & segmented ---------------- */
export function ChipRow({ ariaLabel = "Filtros", children }: { ariaLabel?: string; children: ReactNode }) {
  return <div className="em-chiprow" role="group" aria-label={ariaLabel}>{children}</div>;
}
export function Chip({
  active,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  // Filter toggles: aria-pressed (not role=tab — there are no tabpanels).
  return (
    <button type="button" aria-pressed={active} className={cx("em-chip", active && "active")} {...rest}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="em-segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={cx("em-segment", o.value === value && "active")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Search ---------------- */
export function Search({
  value,
  onChange,
  placeholder = "Buscar",
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: ReactNode;
}) {
  return (
    <label className="em-search">
      {icon}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </label>
  );
}

/* ---------------- Pills / badges ---------------- */
type PillTone = "brand" | "ok" | "warn" | "info" | "muted" | "high" | "med" | "low";
export function Pill({ tone = "muted", dot, children }: { tone?: PillTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={cx("em-pill", `em-pill-${tone}`)}>
      {dot ? <span className="em-pill-dot" aria-hidden /> : null}
      {children}
    </span>
  );
}

/** Honest label for demo/preview content (never presents fabricated data as real). */
export function PreviewTag({ children = "Vista previa" }: { children?: ReactNode }) {
  return <span className="em-preview-tag">{children}</span>;
}

/* ---------------- Avatar ---------------- */
export function Avatar({ initials, large }: { initials: string; large?: boolean }) {
  return <span className={cx("em-avatar", large && "em-avatar-lg")} aria-hidden>{initials}</span>;
}

/* ---------------- Cards & layout ---------------- */
export function Card({
  interactive,
  pad,
  className,
  children,
  as,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  interactive?: boolean;
  pad?: boolean;
  as?: "div" | "button";
}) {
  const cls = cx("em-card", pad && "em-card-pad", interactive && "em-card-interactive", className);
  if (as === "button" || interactive) {
    return <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>;
  }
  return <div className={cls} {...rest}>{children}</div>;
}

export function Stack({ tight, children }: { tight?: boolean; children: ReactNode }) {
  return <div className={tight ? "em-stack-sm" : "em-stack"}>{children}</div>;
}

export function ScreenHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h1 className="em-screen-title">{title}</h1>
      {sub ? <p className="em-screen-sub">{sub}</p> : null}
    </div>
  );
}

export function Section({
  title,
  sub,
  action,
  tag,
  children,
}: {
  title: string;
  sub?: string;
  action?: { label: string; onClick: () => void };
  tag?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="em-section">
      <div className="em-section-head">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 className="em-section-title">{title}</h2>
            {tag}
          </div>
          {sub ? <p className="em-section-sub">{sub}</p> : null}
        </div>
        {action ? (
          <button type="button" className="em-section-action" onClick={action.onClick}>{action.label}</button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/* ---------------- List rows ---------------- */
export function Row({
  title,
  sub,
  leading,
  trailing,
  chevron = true,
  onClick,
}: {
  title: string;
  sub?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="em-row" onClick={onClick}>
      {leading}
      <span className="em-row-body">
        <span className="em-row-title">{title}</span>
        {sub ? <span className="em-row-sub">{sub}</span> : null}
      </span>
      {trailing}
      {chevron ? <IconChevronRight size={18} className="em-row-chevron" /> : null}
    </button>
  );
}

export function DateBadge({ day, month, brand }: { day: string | number; month: string; brand?: boolean }) {
  return (
    <span className={cx("em-datebadge", brand && "em-datebadge-brand")} aria-hidden>
      <span className="em-datebadge-d">{day}</span>
      <span className="em-datebadge-m">{month}</span>
    </span>
  );
}

/* ---------------- States ---------------- */
export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: ReactNode;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <div className="em-empty">
        <span className="em-empty-icon">{icon}</span>
        <div className="em-empty-title">{title}</div>
        {sub ? <p className="em-empty-sub">{sub}</p> : null}
        {action ? <div className="em-empty-action">{action}</div> : null}
      </div>
    </Card>
  );
}

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cx("em-skel", className)} style={style} aria-hidden />;
}

export function ErrorState({ title, sub, icon }: { title: string; sub?: string; icon: ReactNode }) {
  return (
    <div className="em-error" role="alert">
      <span className="em-error-icon">{icon}</span>
      <div>
        <div className="em-error-title">{title}</div>
        {sub ? <div className="em-error-sub">{sub}</div> : null}
      </div>
    </div>
  );
}

/* ---------------- Bottom sheet ---------------- */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="em-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="em-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="em-sheet-grip" aria-hidden />
        <div className="em-sheet-head">
          <h3 className="em-sheet-title">{title}</h3>
          <IconButton label="Cerrar" plain onClick={onClose}><IconClose size={20} /></IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
