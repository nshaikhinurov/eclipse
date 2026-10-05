import { motion } from "motion/react";
import { type ReactNode } from "react";
import { cn } from "~/fsd/shared/lib/utils";
import { Button } from "~/fsd/shared/ui/button";
import { flipValue, type Hint } from "../model";
import { InlineMoon, InlineSun } from "./glyphs";

const Glyph = ({ value }: { value: 0 | 1 }) =>
  value === 1 ? <InlineSun /> : <InlineMoon />;

// Объяснение подсказки в духе обучения: какое правило сработало и что из него следует
const getHintContent = (hint: Hint): { title: string; text: ReactNode } => {
  if (hint.rule === "mistake") {
    const [target] = hint.targets;
    return {
      title: "Something's off",
      text:
        hint.targets.length === 1 ? (
          <>
            This <Glyph value={flipValue(target.value)} /> doesn't fit the
            solution, it should be a <Glyph value={target.value} />.
          </>
        ) : (
          <>
            {hint.targets.length} cells don't fit the solution. Follow the hand
            to fix them.
          </>
        ),
    };
  }

  const value = <Glyph value={hint.value} />;
  const clue = <Glyph value={flipValue(hint.value)} />;
  const lineName = hint.line === "row" ? "row" : "column";

  switch (hint.rule) {
    case "pair":
      return {
        title: "No three in a row",
        text:
          hint.line === "row" ? (
            <>
              Two {clue} sit side by side, so the next cell must be a {value}.
            </>
          ) : (
            <>
              Two {clue} are stacked in this column, so the next cell must be a{" "}
              {value}.
            </>
          ),
      };
    case "sandwich":
      return {
        title: "No three in a row",
        text: (
          <>
            This cell sits between two {clue}
            {hint.line === "col" && " above and below"}. Another {clue} would
            make three in a row, so it is a {value}.
          </>
        ),
      };
    case "half":
      return {
        title: "Half and half",
        text: (
          <>
            This {lineName} already has three {clue}, so{" "}
            {hint.targets.length === 1 ? (
              <>the last cell is a {value}</>
            ) : (
              <>the rest are {value}</>
            )}
            .
          </>
        ),
      };
  }
};

export const HintPanel = ({
  hint,
  className,
  onClose,
}: {
  hint: Hint;
  className?: string;
  onClose: () => void;
}) => {
  const { title, text } = getHintContent(hint);

  return (
    // Панель занимает место кнопок, как и поздравление, — высота экрана не меняется
    <motion.div
      className={cn("grid grid-cols-[1fr_auto] items-start gap-2.5", className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg leading-6 font-extrabold text-white">{title}</h2>
        <p className="text-[0.8125rem] leading-5 text-pretty text-mist">
          {text}
        </p>
      </div>
      <Button size="pill" className="whitespace-nowrap" onClick={onClose}>
        Got it
      </Button>
    </motion.div>
  );
};
