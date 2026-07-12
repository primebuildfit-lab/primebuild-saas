import { useCallback, useState } from "react";
import { useRevalidator } from "react-router";
import type { DataIntent } from "~/db/dataActions";

/**
 * Client persistence dispatcher (MM5, Part 3). Sends each optimistic mutation to
 * the `/app/data` resource route. On success the optimistic local state already
 * reflects the change and the server has persisted it (so a reload re-hydrates
 * from the repository). On failure it surfaces a REAL error — it never fakes a
 * successful mutation — and offers to reconcile by re-running the loader.
 */
export interface PersistenceState {
  onPersist: (intent: DataIntent) => void;
  error: string | null;
  clearError: () => void;
  reconcile: () => void;
}

export function usePersistence(): PersistenceState {
  const revalidator = useRevalidator();
  const [error, setError] = useState<string | null>(null);

  const onPersist = useCallback((intent: DataIntent) => {
    void (async () => {
      try {
        const res = await fetch("/app/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intent),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(
            body?.error ??
              `That change could not be saved (server ${res.status}). Reload to see saved data.`,
          );
        }
      } catch {
        setError(
          "That change could not be saved — the server was unreachable. Reload to see saved data.",
        );
      }
    })();
  }, []);

  const reconcile = useCallback(() => {
    setError(null);
    revalidator.revalidate();
  }, [revalidator]);

  return { onPersist, error, clearError: () => setError(null), reconcile };
}
