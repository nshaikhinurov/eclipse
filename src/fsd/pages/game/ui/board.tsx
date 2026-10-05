import { useMemo } from "react";
import { useCurrentBoard, useShouldDisplayErrors } from "~/fsd/app/stores";
import { useIsClient } from "~/fsd/shared/hooks/use-is-client";
import { getLineBalance } from "../model";
import { CellComponent } from "./cell-component";
import { LinePips } from "./line-pips";

export const Board = () => {
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
    <div className="grid grid-cols-[1fr_18px] grid-rows-[auto_18px] gap-2 rounded-[26px] border border-lilac/14 bg-white/[0.035] p-3.5 select-none">
      <div className="grid aspect-square grid-cols-6 grid-rows-6 gap-[9px]">
        {cells.map((value, index) => (
          <CellComponent key={index} id={index} initialValue={value} />
        ))}
      </div>
      <div className="grid grid-rows-6 gap-[9px]">
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
      <div className="grid grid-cols-6 gap-[9px]">
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
