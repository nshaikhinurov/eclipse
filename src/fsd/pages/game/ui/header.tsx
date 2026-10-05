import { cn } from "~/fsd/shared/lib/utils";
import { Sparkle } from "./sparkle";

// Эмблема-затмение: солнце, которое наполовину закрывает луна
const EclipseEmblem = () => (
  <div className="relative mt-1 size-30" aria-hidden="true">
    <div className="absolute top-4 left-2.5 size-23 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffe2c2,var(--peach)_60%,#e88a52)] shadow-[0_0_1.875rem_rgb(246_168_99/0.7),0_0_5rem_rgb(246_168_99/0.35)]" />
    <div className="absolute top-2 left-6 size-23 rounded-full bg-[radial-gradient(circle_at_70%_30%,#3b347f,var(--night)_70%)] shadow-[inset_0.1875rem_-0.125rem_0_rgb(201_179_247/0.55),0_0_1.125rem_rgb(201_179_247/0.35)]" />
    <Sparkle className="absolute top-1.5 -right-1.5 size-3.5" />
    <Sparkle className="absolute top-1 -left-0.5 size-2" />
  </div>
);

export const Header = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Мягкое свечение чуть выше центра эмблемы */}
      <div
        className="pointer-events-none absolute top-10 left-1/2 -z-10 size-[52.5rem] -translate-1/2 bg-[radial-gradient(circle_closest-side,rgb(169_169_251/0.28),transparent_70%)]"
        aria-hidden="true"
      />
      <EclipseEmblem />
      <h1 className="relative -mt-[1.6875rem] px-4 font-script text-[3.75rem] leading-none text-white [text-shadow:0_0_1.5rem_rgb(201_179_247/0.6),0_0.125rem_0_rgb(38_33_89/0.6)]">
        Eclipse
      </h1>
    </div>
  );
};
