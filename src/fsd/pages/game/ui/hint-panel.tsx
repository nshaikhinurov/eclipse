import { motion } from "motion/react";
import { type ReactNode } from "react";
import { cn } from "~/fsd/shared/lib/utils";
import { Button } from "~/fsd/shared/ui/button";
import { flipValue, type Hint } from "../model";
import { InlineMoon, InlineSun } from "./glyphs";

const Glyph = ({ value }: { value: 0 | 1 }) =>
  value === 1 ? <InlineSun /> : <InlineMoon />;

// Половина линии на досках 6×6, 8×8 и 10×10
const NUMBER_WORDS: Record<number, string> = {
  3: "three",
  4: "four",
  5: "five",
};

type HintContent = { title: string; text: ReactNode };

// Объяснение ошибки: какое правило нарушает значение игрока или почему его пока нельзя было вывести
const getMistakeContent = (
  hint: Extract<Hint, { rule: "mistake" }>,
): HintContent => {
  const [target] = hint.targets;
  const wrong = <Glyph value={flipValue(target.value)} />;
  const right = <Glyph value={target.value} />;
  const lineName = hint.line === "row" ? "row" : "column";

  switch (hint.reason) {
    case "three":
      return {
        title: "No three in a row",
        text: (
          <>
            This {wrong} makes three {wrong}{" "}
            {hint.line === "row" ? "in a row" : "in a column"}, so it should be
            a {right}.
          </>
        ),
      };
    case "half": {
      const count = hint.clues.length;
      return {
        title: "Half and half",
        text: (
          <>
            This {lineName} already has {NUMBER_WORDS[count] ?? count} {wrong}{" "}
            besides this one, and only half of it can be {wrong}. So it should
            be a {right}.
          </>
        ),
      };
    }
    case "copy":
      return {
        title: "No twins",
        text: (
          <>
            This {wrong} makes the {lineName} a copy of the highlighted{" "}
            {lineName}. No two {lineName}s are the same, so it should be a{" "}
            {right}.
          </>
        ),
      };
    case "lookahead":
      return {
        title: "Think ahead",
        text: (
          <>
            With this {wrong}, the rest of the {lineName} can't be filled:
            keeping <InlineSun /> and <InlineMoon /> equal would force three in
            a row. So it should be a {right}.
          </>
        ),
      };
    case "twins":
      return {
        title: "No twins",
        text: (
          <>
            With this {wrong}, the {lineName} could only end up as a copy of a
            highlighted {lineName}. No two {lineName}s are the same, so it
            should be a {right}.
          </>
        ),
      };
    case "guess":
      return {
        title: "Something's off",
        text:
          hint.targets.length === 1 ? (
            <>
              This {wrong} should be a {right}. Its row and column don't decide
              this cell yet, so it was a guess, and it leads to a dead end later
              on.
            </>
          ) : (
            <>
              {hint.targets.length} cells don't fit the solution. Their rows and
              columns don't decide them yet, so they were guesses that lead to a
              dead end. Follow the hand to fix them.
            </>
          ),
      };
  }
};

// Объяснение подсказки в духе обучения: какое правило сработало и что из него следует
const getHintContent = (hint: Hint): HintContent => {
  if (hint.rule === "mistake") {
    return getMistakeContent(hint);
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
    case "half": {
      // В clues — все заполненные клетки линии, в targets — все пустые, вместе это вся линия
      const half = (hint.clues.length + hint.targets.length) / 2;
      return {
        title: "Half and half",
        text: (
          <>
            This {lineName} already has {NUMBER_WORDS[half] ?? half} {clue}, so{" "}
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
    case "lookahead":
      return {
        title: "Think ahead",
        text: (
          <>
            Imagine a {clue} here. Then the rest of this {lineName} can't be
            filled: keeping <InlineSun /> and <InlineMoon /> equal would force
            three in a row. So it's a {value}.
          </>
        ),
      };
    case "twins":
      return {
        title: "No twins",
        text: (
          <>
            With a {clue} here, this {lineName} could only end up as a copy of a
            highlighted {lineName}. No two {lineName}s are the same, so it's a{" "}
            {value}.
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
