import { cn } from "~/fsd/shared/lib/utils";
import { Sparkle } from "./sparkle";

// Эмблема «бриллиантовое кольцо»: луна целиком закрыла солнце, остался тонкий обод и последний яркий луч
const EclipseEmblem = () => (
  <svg
    viewBox="0 0 120 120"
    className="-mt-4 size-30 overflow-visible"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="emblem-moon" cx="70%" cy="30%" r="70%">
        <stop offset="0" stopColor="#3b347f" />
        <stop offset=".7" stopColor="var(--night)" />
      </radialGradient>
      <filter id="emblem-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
    <circle
      cx="58"
      cy="60"
      r="38"
      fill="none"
      stroke="var(--peach)"
      strokeWidth="5"
      opacity="0.7"
      filter="url(#emblem-glow)"
    />
    <circle
      cx="58"
      cy="60"
      r="38"
      fill="none"
      stroke="#ffe2c2"
      strokeWidth="1.3"
    />
    <circle cx="58" cy="60" r="37.3" fill="url(#emblem-moon)" />
    <circle
      cx="84.9"
      cy="33.1"
      r="11"
      fill="var(--peach)"
      filter="url(#emblem-glow)"
    />
    <circle cx="84.9" cy="33.1" r="4.5" fill="#fff" />
    <Sparkle x="66.9" y="15.1" width="36" height="36" />
  </svg>
);

export const Header = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Мягкое свечение чуть выше центра эмблемы */}
      <div
        className="pointer-events-none absolute top-5 left-1/2 -z-10 size-[52.5rem] -translate-1/2 bg-[radial-gradient(circle_closest-side,rgb(169_169_251/0.28),transparent_70%)]"
        aria-hidden="true"
      />
      <EclipseEmblem />
      <h1 className="relative -mt-[1.6875rem] px-4 pb-3 font-script text-[3.75rem] leading-none text-white [text-shadow:0_0_1.5rem_rgb(201_179_247/0.6),0_0.125rem_0_rgb(38_33_89/0.6)]">
        Eclipse
      </h1>
    </div>
  );
};
