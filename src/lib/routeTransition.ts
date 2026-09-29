import { createContext, useContext } from "react";

export type RouteTransitionApi = {
  /** Draw the curtain down. Resolves once the viewport is fully covered. */
  cover: () => Promise<void>;
  /** Send the curtain away. The route effect calls this for you. */
  part: () => void;
  /** Cover, then navigate — the usual way to leave one page for another. */
  go: (to: string, state?: unknown) => void;
  /** True until the page below has taken over. */
  busy: boolean;
};

export const RouteTransitionContext = createContext<RouteTransitionApi | null>(null);

export function useRouteTransition(): RouteTransitionApi {
  const api = useContext(RouteTransitionContext);
  if (!api) throw new Error("useRouteTransition must be used inside <RouteTransition>");
  return api;
}
