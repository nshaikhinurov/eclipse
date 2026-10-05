import { useMemo } from "react";
import { useCurrentBoard, useShouldDisplayErrors } from "~/fsd/app/stores";
import { useIsClient } from "~/fsd/shared/hooks/use-is-client";
import { cn } from "~/fsd/shared/lib/utils";
import { getLineBalance } from "../model";
import { CellComponent } from "./cell-component";
import { LinePips } from "./line-pips";

export const Board = ({ className }: { className?: string }) => {
  const currentBoard = useCurrentBoard();
  const shouldDisplayErrors = useShouldDisplayErrors();
  const isClient = useIsClient();

  const cells = useMemo(() => {
    return (currentBoard || []).flat();
  }, [currentBoard]);

  // До гидрации доска на сервере и клиенте разная — показываем пустые индикаторы
  const { rows, cols } = useMemo(() => {
    const balance = getLineBalance(currentBoard || []);
    if (isClient) return balance;
    const empty = () => ({ suns: 0, moons: 0 });
    return { rows: balance.rows.map(empty), cols: balance.cols.map(empty) };
  }, [currentBoard, isClient]);

  const half = (currentBoard?.length ?? 0) / 2;

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_1.125rem] grid-rows-[auto_1.125rem] gap-2 rounded-[1.625rem] border border-lilac/14 bg-white/[0.035] p-3.5",
        className,
      )}
    >
      <div className="grid aspect-square grid-cols-6 grid-rows-6 gap-2.25">
        {cells.map((value, index) => (
          <CellComponent key={index} id={index} initialValue={value} />
        ))}
      </div>
      <div className="grid grid-rows-6 gap-2.25">
        {rows.map((balance, index) => (
          <LinePips
            key={index}
            balance={balance}
            half={half}
            direction="row"
            shouldDisplayErrors={shouldDisplayErrors}
          />
        ))}
      </div>
      <div className="grid grid-cols-6 gap-2.25">
        {cols.map((balance, index) => (
          <LinePips
            key={index}
            balance={balance}
            half={half}
            direction="col"
            shouldDisplayErrors={shouldDisplayErrors}
          />
        ))}
      </div>
    </div>
  );
};
