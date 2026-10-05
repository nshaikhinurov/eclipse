import cn from "clsx";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCell, useGameStateStore } from "~/fsd/app/stores";
import { CellValue } from "../model";

export const CellComponent = ({
  id,
  initialValue,
}: {
  id: number;
  initialValue: CellValue;
}) => {
  const [isLocked] = useState(initialValue !== null);
  const [isClient, setIsClient] = useState(false);
  const { cellClicked } = useGameStateStore();
  const cellValue = useCell(id);

  // Устанавливаем флаг что мы на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClick = () => {
    cellClicked(id);
  };

  return (
    <motion.div
      className={cn(
        "box-border flex items-center justify-center border-[1px] border-stone-300 bg-stone-50",
        {
          "rounded-tl-[6px]": id === 0,
          "rounded-tr-[6px]": id === 5,
          "rounded-bl-[6px]": id === 30,
          "rounded-br-[6px]": id === 35,
          "cursor-not-allowed bg-stone-200": isClient && isLocked,
          "cursor-pointer transition hover:bg-stone-100 active:scale-90":
            isClient && !isLocked,
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
            className="absolute"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
          >
            <Image
              src={cellValue === 1 ? "/sun.svg" : "/moon.svg"}
              alt={cellValue === 1 ? "Sun" : "Moon"}
              width={32}
              height={32}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
