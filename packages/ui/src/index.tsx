import type {
  ButtonHTMLAttributes,
  ComponentType,
  CSSProperties,
  ReactNode,
} from "react";

/**
 * @eventra/ui — product-neutral, accessible UI primitives + a responsive app
 * shell shared across Consumer / Business / Admin. Self-styled via CSS variables
 * (import "@eventra/ui/tokens.css" once per app). No routing/product assumptions:
 * navigation link rendering is injected so each app uses its own router.
 */

const c = {
  surface: "var(--eventra-surface, #fff)",
  border: "var(--eventra-border, #e5e7eb)",
  borderSoft: "var(--eventra-border-soft, #f3f4f6)",
  text: "var(--eventra-text, #111827)",
  muted: "var(--eventra-text-muted, #6b7280)",
  brand: "var(--eventra-brand-600, #4f46e5)",
  brand50: "var(--eventra-brand-50, #eef2ff)",
  brand700: "var(--eventra-brand-700, #4338ca)",
  radius: "var(--eventra-radius, 12px)",
  shadow: "var(--eventra-shadow, 0 1px 2px rgba(16,24,40,.06))",
};

export function Button({
  variant = "primary",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const base: CSSProperties = {
    height: 40,
    padding: "0 16px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    border: "1px solid transparent",
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: c.brand, color: "#fff" },
    secondary: { background: c.surface, color: c.text, borderColor: c.border },
  };
  return <button type="button" style={{ ...base, ...variants[variant], ...style }} {...props} />;
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: c.radius, boxShadow: c.shadow, ...style }}>
      {children}
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, background: c.brand50, color: c.brand700, fontSize: 12, fontWeight: 600 }}>
      {children}
    </span>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{title}</h1>
        {description ? <p style={{ color: c.muted, margin: "4px 0 0", fontSize: 14 }}>{description}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div style={{ border: `1px dashed ${c.border}`, borderRadius: c.radius, padding: "56px 24px", textAlign: "center", background: "rgba(255,255,255,.6)" }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h3>
      {description ? <p style={{ color: c.muted, marginTop: 6, fontSize: 14 }}>{description}</p> : null}
      {action ? <div style={{ marginTop: 20 }}>{action}</div> : null}
    </div>
  );
}

/** Honest "foundation only" placeholder for a not-yet-built surface. */
export function PlaceholderPage({ title, note }: { title: string; note?: string }) {
  return (
    <div>
      <PageHeader title={title} description="Foundation shell — this surface is scaffolded, not yet built." />
      <EmptyState
        title="Coming in a later Mega Module"
        description={note ?? "This route exists so navigation and the app shell can be verified. No product logic yet."}
      />
    </div>
  );
}

export interface NavItem {
  label: string;
  to: string;
  active?: boolean;
  group?: string;
}

type LinkProps = { to: string; children: ReactNode; style?: CSSProperties; "aria-current"?: "page" };
export type LinkComponent = ComponentType<LinkProps>;

const DefaultLink: LinkComponent = ({ to, children, style }) => (
  <a href={to} style={style}>{children}</a>
);

/**
 * Responsive product shell: sidebar (desktop) + top bar + main. Nav links are
 * rendered via the injected `Link` (each app passes its router's link).
 */
export function AppShell({
  productName,
  badge,
  nav,
  children,
  Link = DefaultLink,
  desktopFirst = false,
}: {
  productName: string;
  badge?: string;
  nav: NavItem[];
  children: ReactNode;
  Link?: LinkComponent;
  desktopFirst?: boolean;
}) {
  const groups = [...new Set(nav.map((n) => n.group ?? ""))];
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: desktopFirst ? "260px 1fr" : "240px 1fr" }}>
      <aside style={{ borderRight: `1px solid ${c.border}`, background: c.surface, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, fontWeight: 700 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: c.brand, display: "inline-block" }} />
          {productName}
          {badge ? <span style={{ marginLeft: "auto" }}><Badge>{badge}</Badge></span> : null}
        </div>
        <nav aria-label="Primary" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 2 }}>
          {groups.map((g) => (
            <div key={g || "_"}>
              {g ? <div style={{ fontSize: 11, textTransform: "uppercase", color: c.muted, letterSpacing: ".04em", padding: "12px 8px 4px" }}>{g}</div> : null}
              {nav.filter((n) => (n.group ?? "") === g).map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={n.active ? "page" : undefined}
                  style={{
                    display: "block", padding: "8px 12px", borderRadius: 8, fontSize: 14,
                    textDecoration: "none", fontWeight: 500,
                    color: n.active ? c.brand700 : c.muted,
                    background: n.active ? c.brand50 : "transparent",
                  }}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div>
        <header style={{ height: 56, borderBottom: `1px solid ${c.border}`, background: c.surface, display: "flex", alignItems: "center", padding: "0 24px", position: "sticky", top: 0 }}>
          <strong style={{ fontSize: 14 }}>{productName}</strong>
          <span style={{ marginLeft: "auto", color: c.muted, fontSize: 12 }}>Foundation shell</span>
        </header>
        <main style={{ maxWidth: 1120, margin: "0 auto", padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
