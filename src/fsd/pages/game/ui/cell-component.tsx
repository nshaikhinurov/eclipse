import { AnimatePresence, motion } from "motion/react";
import { memo, useState } from "react";
import { useCell, useGameStateStore } from "~/fsd/app/stores";
import { useIsClient } from "~/fsd/shared/hooks/use-is-client";
import { cn } from "~/fsd/shared/lib/utils";
import { CellValue } from "../model";
import { MoonGlyph, SunGlyph } from "./glyphs";
import { TapHand } from "./tap-hand";

// Роль клетки в показанной подсказке: куда ходить, на что опираться, что приглушить
export type CellHintRole = "target" | "clue" | "dimmed";

// memo: при ходе доска перерисовывается целиком, а клетке нужно обновиться, только если изменились её пропсы
export const CellComponent = memo(function CellComponent({
  id,
  initialValue,
  hintRole,
  handTaps,
}: {
  id: number;
  initialValue: CellValue;
  hintRole?: CellHintRole;
  // Сколько раз палец подсказки тапает по клетке; без значения палец не показываем
  handTaps?: number;
}) {
  const [isLocked] = useState(initialValue !== null);
  const isClient = useIsClient();
  const cellClicked = useGameStateStore((state) => state.cellClicked);
  const cellValue = useCell(id);
  // Пока открыта подсказка, нажимать можно только на её клетки
  const isClickable =
    isClient && !isLocked && (hintRole === undefined || hintRole === "target");

  const handleClick = () => {
    cellClicked(id);
  };

  return (
    <motion.div
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full",
        {
          "bg-lilac/12": isClient && isLocked,
          "bg-white/4 inset-ring inset-ring-lilac/18": !isClient || !isLocked,
          "cursor-pointer transition hover:bg-white/9 hover:inset-ring-lilac/40 active:scale-90":
            isClickable,
          "inset-ring-2 inset-ring-peach/70 hover:inset-ring-peach/70":
            hintRole === "target",
        },
      )}
      initial={{ opacity: 0, scale: 1 }}
      // Прозрачность ведёт motion: его инлайн-стиль перебил бы класс
      animate={{ opacity: hintRole === "dimmed" ? 0.3 : 1, scale: 1 }}
      transition={{ opacity: { duration: 0.3 } }}
      onClick={isClickable ? handleClick : undefined}
    >
      <CellGlyph value={isClient ? cellValue : null} />
      {handTaps !== undefined && (
        <TapHand key={`${cellValue}`} taps={handTaps} />
      )}
    </motion.div>
  );
});

// Солнце или луна в клетке с анимацией появления и смены
export const CellGlyph = ({ value }: { value: CellValue }) => (
  <AnimatePresence>
    {value !== null && (
      <motion.div
        key={value}
        className={cn(
          "absolute inset-[7%]",
          value === 1
            ? "drop-shadow-[0_0_0.5rem_rgb(246_168_99/0.55)]"
            : "drop-shadow-[0_0_0.5rem_rgb(201_179_247/0.5)]",
        )}
        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.7 }}
      >
        {value === 1 ? (
          <SunGlyph className="size-full" />
        ) : (
          <MoonGlyph className="size-full" />
        )}
      </motion.div>
    )}
  </AnimatePresence>
);
