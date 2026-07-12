import { NavLink } from "react-router";
import { primaryNav, secondaryNav, adminNav, type NavItem } from "~/lib/nav";
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
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </p>
  );
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {primaryNav.map((item) => (
        <Item key={item.to} item={item} onNavigate={onNavigate} />
      ))}

      <SectionLabel>Account</SectionLabel>
      {secondaryNav.map((item) => (
        <Item key={item.to} item={item} onNavigate={onNavigate} />
      ))}

      <SectionLabel>Platform</SectionLabel>
      {adminNav.map((item) => (
        <Item key={item.to} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
