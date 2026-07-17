import { NavLink } from "react-router";
import { navGroups, type NavItem } from "~/lib/nav";
import { cn } from "~/lib/cn";

function Item({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200"
            : "text-ink-muted hover:bg-surface-2 hover:text-ink",
        )
      }
      title={item.hint}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors",
              isActive ? "text-accent" : "text-ink-faint group-hover:text-ink-muted",
            )}
          />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
      {children}
    </p>
  );
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Primary">
      {navGroups.map((group) => (
        <div key={group.label}>
          <SectionLabel>{group.label}</SectionLabel>
          {group.items.map((item) => (
            <Item key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
}
