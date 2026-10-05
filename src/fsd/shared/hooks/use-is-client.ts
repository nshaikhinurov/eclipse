import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false during SSR and hydration, true after the client takes over
export const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
