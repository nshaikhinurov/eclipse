import cn from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "~/fsd/shared/ui/button";
import { type Board, type Cell, getNextValue, hasCell } from "../model";
import { CellGlyph } from "./cell-component";
import { InlineMoon as Moon, InlineSun as Sun } from "./glyphs";
import { countTaps, TapHand } from "./tap-hand";

type TutorialStep = {
  title: string;
  text: ReactNode;
  // Клетки, которые игрок заполняет на этом шаге
  targets: Cell[];
  // Клетки, на которые опирается рассуждение; всё остальное приглушаем
  clues: Cell[];
};

// Решение обучающей головоломки: 1 — солнце, 0 — луна
const SOLUTION: (0 | 1)[][] = [
  [0, 0, 1, 0, 1, 1],
  [0, 0, 1, 1, 0, 1],
  [1, 1, 0, 0, 1, 0],
  [0, 1, 0, 0, 1, 1],
  [1, 0, 1, 1, 0, 0],
  [1, 1, 0, 1, 0, 0],
];

// Каждый шаг — одно правило на конкретной клетке; к последнему доска решена целиком
const STEPS: TutorialStep[] = [
  {
    title: "No three in a row",
    text: (
      <>
        No more than 2 <Sun /> or <Moon /> may sit next to each other. Two{" "}
        <Sun /> are side by side here, so the next cell is a <Moon />. Tap it
        once.
      </>
    ),
    targets: [[2, 2]],
    clues: [
      [2, 0],
      [2, 1],
    ],
  },
  {
    title: "Up and down too",
    text: (
      <>
        The rule works vertically as well. A <Moon /> here would make three in a
        column, so it must be a <Sun />. Tap twice.
      </>
    ),
    targets: [[3, 5]],
    clues: [
      [2, 5],
      [4, 5],
    ],
  },
  {
    title: "Half and half",
    text: (
      <>
        Each row and column holds three <Sun /> and three <Moon />. This row has
        all its <Sun />, so the rest are <Moon />.
      </>
    ),
    targets: [
      [5, 4],
      [5, 5],
    ],
    clues: [
      [5, 0],
      [5, 1],
      [5, 2],
      [5, 3],
    ],
  },
  {
    title: "Think ahead",
    text: (
      <>
        Imagine a <Sun /> here. That's the row's third <Sun />, so both empty
        cells would be <Moon />: three <Moon /> in a row. So it is a <Moon />.
        Tap it once.
      </>
    ),
    targets: [[3, 0]],
    clues: [
      [3, 3],
      [3, 4],
      [3, 5],
    ],
  },
  {
    title: "No twins",
    text: (
      <>
        No two rows (or columns) may be the same. <Moon />
        <Sun /> here would copy the top row, so it is <Sun />
        <Moon />.
      </>
    ),
    targets: [
      [3, 1],
      [3, 2],
    ],
    clues: [
      ...SOLUTION[0].map((_, col): Cell => [0, col]),
      [3, 0],
      [3, 3],
      [3, 4],
      [3, 5],
    ],
  },
  {
    title: "You're ready",
    text: (
      <>
        A tap cycles a cell through <Moon />, <Sun /> and empty. Every puzzle
        has one answer and is solved by logic alone, never by guessing.
      </>
    ),
    targets: [],
    clues: [],
  },
];

const isTutorialCell = (row: number, col: number) =>
  STEPS.some((step) => hasCell(step.targets, row, col));

const createInitialBoard = (): Board =>
  SOLUTION.map((line, row) =>
    line.map((value, col) => (isTutorialCell(row, col) ? null : value)),
  );

type TutorialProps = {
  boardClassName?: string;
  panelClassName?: string;
  onFinish: () => void;
};

// Обучение на фиксированной головоломке: по шагу на правило, палец показывает, куда тапнуть
export const Tutorial = ({
  boardClassName,
  panelClassName,
  onFinish,
}: TutorialProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [board, setBoard] = useState(createInitialBoard);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const isSolved = (row: number, col: number) =>
    board[row][col] === SOLUTION[row][col];
  const isStepSolved = step.targets.every(([row, col]) => isSolved(row, col));
  const handTarget = step.targets.find(([row, col]) => !isSolved(row, col));

  // Решённый шаг даём рассмотреть и переходим к следующему
  useEffect(() => {
    if (!isStepSolved || isLastStep) return;
    const timeout = setTimeout(() => setStepIndex((index) => index + 1), 900);
    return () => clearTimeout(timeout);
  }, [isStepSolved, isLastStep]);

  const handleCellClick = (row: number, col: number) => {
    setBoard((current) =>
      current.map((line, r) =>
        r === row
          ? line.map((value, c) => (c === col ? getNextValue(value) : value))
          : line,
      ),
    );
  };

  return (
    <>
      <div
        className={cn(
          "rounded-[1.625rem] border border-lilac/14 bg-white/[0.035] p-3.5",
          boardClassName,
        )}
      >
        <div className="grid aspect-square grid-cols-6 grid-rows-6 gap-2.25">
          {board.flatMap((line, row) =>
            line.map((value, col) => {
              const isTarget = hasCell(step.targets, row, col);
              const isActive = isTarget && !isSolved(row, col);
              const isDimmed =
                step.targets.length > 0 &&
                !isTarget &&
                !hasCell(step.clues, row, col);
              const isHandHere =
                handTarget?.[0] === row && handTarget?.[1] === col;

              return (
                // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  key={`${row}-${col}`}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-full transition-opacity duration-300",
                    isTutorialCell(row, col)
                      ? "bg-white/4 inset-ring inset-ring-lilac/18"
                      : "bg-lilac/12",
                    isActive &&
                      "cursor-pointer inset-ring-2 inset-ring-peach/70 transition hover:bg-white/9 active:scale-90",
                    isDimmed && "opacity-30",
                  )}
                  onClick={
                    isActive ? () => handleCellClick(row, col) : undefined
                  }
                >
                  <CellGlyph value={value} />
                  {isHandHere && (
                    <TapHand
                      key={`${row}-${col}-${value}`}
                      taps={countTaps(value, SOLUTION[row][col])}
                    />
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className={cn("flex flex-col gap-3", panelClassName)}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stepIndex}
            className="flex flex-col gap-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg leading-6 font-extrabold text-white">
              {step.title}
            </h2>
            <p className="text-[0.8125rem] leading-5 text-pretty text-mist">
              {step.text}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between gap-4">
          <div
            className="flex gap-1.5"
            aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}
          >
            {STEPS.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === stepIndex
                    ? "w-5 bg-peach"
                    : index < stepIndex
                      ? "w-1.5 bg-peach/60"
                      : "w-1.5 bg-white/15",
                )}
              />
            ))}
          </div>
          {isLastStep ? (
            <Button variant="accent" size="pill" onClick={onFinish}>
              Start playing
            </Button>
          ) : (
            <Button size="pill" onClick={onFinish}>
              Skip
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
