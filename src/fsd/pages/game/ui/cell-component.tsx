import cn from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCell, useGameStateStore } from "~/fsd/app/stores";
import { useIsClient } from "~/fsd/shared/hooks/use-is-client";
import { CellValue } from "../model";
import { MoonGlyph, SunGlyph } from "./glyphs";

export const CellComponent = ({
  id,
  initialValue,
}: {
  id: number;
  initialValue: CellValue;
}) => {
  const [isLocked] = useState(initialValue !== null);
  const isClient = useIsClient();
  const { cellClicked } = useGameStateStore();
  const cellValue = useCell(id);

  const handleClick = () => {
    cellClicked(id);
  };

  return (
    <motion.div
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full",
        {
          "bg-lilac/12": isClient && isLocked,
          "cursor-pointer bg-white/4 inset-ring inset-ring-lilac/18 transition hover:bg-white/9 hover:inset-ring-lilac/40 active:scale-90":
            isClient && !isLocked,
          "bg-white/4 inset-ring inset-ring-lilac/18": !isClient,
        },
      )}
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={isClient && !isLocked ? handleClick : undefined}
    >
      <AnimatePresence>
        {isClient && cellValue !== null && (
          <motion.div
            key={cellValue}
            className={cn(
              "absolute inset-[7%]",
              cellValue === 1
                ? "drop-shadow-[0_0_8px_rgb(246_168_99/0.55)]"
                : "drop-shadow-[0_0_8px_rgb(201_179_247/0.5)]",
            )}
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
          >
            {cellValue === 1 ? (
              <SunGlyph className="size-full" />
            ) : (
              <MoonGlyph className="size-full" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
