/**
 * useLoadState — the ONE async data pattern for every Business Admin screen.
 *
 * Runs an async fetcher that returns a `LoadState<T>`, exposes it with a real
 * loading phase, plus `reload()` for refetch-after-mutation. `not_connected` is
 * only ever returned by the fetcher itself (missing API/session) — never as a
 * permanent hard-coded placeholder. Pass `enabled: false` to inject state in tests.
 */
import { useCallback, useEffect, useState } from "react";
import type { LoadState } from "../data/live/types";

export function useLoadState<T>(
  fetcher: () => Promise<LoadState<T>>,
  opts: { enabled?: boolean; deps?: unknown[] } = {},
): { state: LoadState<T>; reload: () => void } {
  const { enabled = true, deps = [] } = opts;
  const [state, setState] = useState<LoadState<T>>(
    enabled ? { kind: "loading" } : { kind: "not_connected" },
  );
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setState({ kind: "loading" });
    fetcher()
      .then((s) => { if (alive) setState(s); })
      .catch((e) => {
        if (alive) setState({ kind: "error", message: e instanceof Error ? e.message : "Error de carga" });
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nonce, ...deps]);

  return { state, reload };
}
