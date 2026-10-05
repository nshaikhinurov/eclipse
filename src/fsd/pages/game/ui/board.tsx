import { useMemo } from "react";
import { useCurrentBoard } from "~/fsd/app/stores";
import { CellComponent } from "./cell-component";

export const Board = () => {
  const currentBoard = useCurrentBoard();

  const cells = useMemo(() => {
    return (currentBoard || []).flat();
  }, [currentBoard]);

  return (
    <div className="grid aspect-square grid-cols-6 grid-rows-6 overflow-hidden rounded-sm bg-stone-300 outline-1 outline-stone-300 select-none">
      {cells.map((value, index) => (
        <CellComponent key={index} id={index} initialValue={value} />
      ))}
    </div>
  );
};
