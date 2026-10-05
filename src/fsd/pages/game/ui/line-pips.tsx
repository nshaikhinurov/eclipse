import cn from "clsx";
import type { LineBalance } from "../model";

type LinePipsProps = {
  balance: LineBalance;
  // Сколько символов каждого вида должно быть в линии
  half: number;
  direction: "row" | "col";
  shouldDisplayErrors: boolean;
};

// Индикатор баланса линии: верхний/левый ряд точек — солнца, второй — луны
export const LinePips = ({
  balance,
  half,
  direction,
  shouldDisplayErrors,
}: LinePipsProps) => {
  const isBalanced = balance.suns === half && balance.moons === half;
  const isOverflown =
    shouldDisplayErrors && (balance.suns > half || balance.moons > half);

  const renderPips = (count: number, filledClassName: string) =>
    Array.from({ length: half }, (_, index) => (
      <span
        key={index}
        className={cn(
          "size-[5px] rounded-full transition-colors duration-250",
          index < count
            ? isOverflown
              ? "bg-rose"
              : filledClassName
            : "bg-white/12",
          isBalanced && "shadow-[0_0_6px_white]",
        )}
      />
    ));

  return (
    <div
      className={cn(
        "grid place-content-center gap-[3px]",
        direction === "row"
          ? "grid-flow-col grid-cols-[repeat(2,5px)] grid-rows-[repeat(3,5px)]"
          : "grid-cols-[repeat(3,5px)] grid-rows-[repeat(2,5px)]",
      )}
    >
      {renderPips(balance.suns, "bg-peach")}
      {renderPips(balance.moons, "bg-lilac")}
    </div>
  );
};
