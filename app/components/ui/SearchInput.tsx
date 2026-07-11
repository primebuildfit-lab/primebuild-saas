import { Search } from "lucide-react";
import { TextInput } from "./FormControls";
import { cn } from "~/lib/cn";

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** wrapper class (e.g. width constraints) */
  className?: string;
  "aria-label"?: string;
}

/** Search field with a leading icon — shared across list/filter surfaces. */
export function SearchInput({
  value,
  onValueChange,
  placeholder = "Search…",
  className,
  "aria-label": ariaLabel,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <TextInput
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label={ariaLabel ?? placeholder}
      />
    </div>
  );
}
