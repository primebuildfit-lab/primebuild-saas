import { Link, type LinkProps } from "react-router";
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "./Button";

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A react-router Link styled as a Button (for navigation actions). */
export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
