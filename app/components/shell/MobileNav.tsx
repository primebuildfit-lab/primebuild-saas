import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Brand } from "./Brand";
import { NavLinks } from "./NavLinks";
import { useDialog } from "~/hooks/useDialog";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const dialogRef = useDialog<HTMLElement>(open, onClose);
  return (
    <AnimatePresence>
      {open ? (
        <div className="lg:hidden">
          <motion.div
            className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          />
          <motion.aside
            ref={dialogRef}
            tabIndex={-1}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl focus:outline-none"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
              <Brand />
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks onNavigate={onClose} />
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
