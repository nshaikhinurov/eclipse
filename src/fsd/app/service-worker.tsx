"use client";

import { useEffect } from "react";

// Регистрирует офлайн-кэш (public/sw.js). В dev он только мешал бы HMR,
// поэтому там, наоборот, снимаем воркер, оставшийся от прод-сборки.
export const ServiceWorker = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((r) => r.unregister()));
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      // Без воркера игра просто остаётся онлайн-only — не критично
      .catch(() => {});
  }, []);

  return null;
};
