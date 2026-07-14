import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "~/lib/cn";

const base =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-sm placeholder:text-ink-faint " +
  "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 " +
  "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-faint";

export const TextInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input ref={ref} type={type} className={cn(base, "h-10", className)} {...props} />
));
TextInput.displayName = "TextInput";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(base, "resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(base, "h-10 pr-8", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";
