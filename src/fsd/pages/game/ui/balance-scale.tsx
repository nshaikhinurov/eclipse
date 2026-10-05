import { useMemo } from "react";
import { useCurrentBoard } from "~/fsd/app/stores";
import { useIsClient } from "~/fsd/shared/hooks/use-is-client";
import { MoonGlyph, SunGlyph } from "./glyphs";

// Весы над полем: сколько солнц и лун уже стоит из нужного количества
export const BalanceScale = () => {
  const currentBoard = useCurrentBoard();
  const isClient = useIsClient();

  const { suns, moons, total } = useMemo(() => {
    const cells = isClient ? (currentBoard || []).flat() : [];
    return {
      suns: cells.filter((cell) => cell === 1).length,
      moons: cells.filter((cell) => cell === 0).length,
      total: ((currentBoard?.length ?? 0) ** 2 / 2) || 1,
    };
  }, [currentBoard, isClient]);

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[13px] font-extrabold tabular-nums">
      <span className="inline-flex items-center gap-1.5">
        <SunGlyph className="size-[22px]" />
        {suns}
      </span>
      <div className="relative h-2 rounded-full bg-white/8">
        <div
          className="absolute inset-y-0 right-1/2 rounded-l-full bg-linear-to-l from-peach to-[#ffcfa1] transition-[width] duration-350"
          style={{ width: `${(suns / total) * 50}%` }}
        />
        <div
          className="absolute inset-y-0 left-1/2 rounded-r-full bg-linear-to-r from-lilac to-blush transition-[width] duration-350"
          style={{ width: `${(moons / total) * 50}%` }}
        />
        <div className="absolute top-1/2 left-1/2 size-3.5 -translate-1/2 rotate-45 rounded-[2px] border-3 border-night bg-sky" />
      </div>
      <span className="inline-flex items-center gap-1.5">
        {moons}
        <MoonGlyph className="size-[22px]" />
      </span>
    </div>
  );
};
