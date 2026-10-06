import { useMemo } from "react";
import { useCurrentBoard } from "~/fsd/app/stores";
import { cn } from "~/fsd/shared/lib/utils";
import { hasCell, type Hint } from "../model";
import { CellComponent, type CellHintRole } from "./cell-component";
import { countTaps } from "./tap-hand";

export const Board = ({
  className,
  hint,
}: {
  className?: string;
  hint?: Hint | null;
}) => {
  const currentBoard = useCurrentBoard();

  const cells = useMemo(() => {
    return (currentBoard || []).flat();
  }, [currentBoard]);

  const size = currentBoard?.length ?? 0;

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
        "rounded-[1.625rem] border border-lilac/14 bg-white/[0.035] p-3.5",
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
    </div>
  );
};
