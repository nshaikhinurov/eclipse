import { useMemo } from "react";
import { useCurrentBoard, useShouldDisplayErrors } from "~/fsd/app/stores";
import { useIsClient } from "~/fsd/shared/hooks/use-is-client";
import { cn } from "~/fsd/shared/lib/utils";
import { getLineBalance, hasCell, type Hint } from "../model";
import { CellComponent, type CellHintRole } from "./cell-component";
import { LinePips } from "./line-pips";
import { countTaps } from "./tap-hand";

export const Board = ({
  className,
  hint,
}: {
  className?: string;
  hint?: Hint | null;
}) => {
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

  const size = currentBoard?.length ?? 0;
  const half = size / 2;

  // Решённые клетки подсказки гаснут как цель, палец переходит к следующей
  const pendingTargets =
    hint?.targets.filter(
      ({ cell: [row, col], value }) => currentBoard?.[row][col] !== value,
    ) ?? [];
  const handTarget = pendingTargets[0];

  const getHintRole = (row: number, col: number): CellHintRole | undefined => {
    if (!hint) return undefined;
    if (pendingTargets.some(({ cell }) => hasCell([cell], row, col))) {
      return "target";
    }
    const isSolvedTarget = hint.targets.some(({ cell }) =>
      hasCell([cell], row, col),
    );
    return isSolvedTarget || hasCell(hint.clues, row, col) ? "clue" : "dimmed";
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_1.125rem] grid-rows-[auto_1.125rem] gap-2 rounded-[1.625rem] border border-lilac/14 bg-white/[0.035] p-3.5",
        className,
      )}
    >
      <div className="grid aspect-square grid-cols-6 grid-rows-6 gap-2.25">
        {cells.map((value, index) => {
          const row = Math.floor(index / size);
          const col = index % size;
          const isHandHere =
            handTarget?.cell[0] === row && handTarget?.cell[1] === col;
          return (
            <CellComponent
              key={index}
              id={index}
              initialValue={value}
              hintRole={getHintRole(row, col)}
              handTaps={
                isHandHere ? countTaps(value, handTarget.value) : undefined
              }
            />
          );
        })}
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
