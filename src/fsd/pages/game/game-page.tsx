"use client";

import { useEffect } from "react";
import { useIsClient } from "~/fsd/shared/hooks/use-is-client";
import { cn, pickRandom } from "~/fsd/shared/lib/utils";
import {
  Eraser,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Undo2,
  WandSparkles,
} from "lucide-react";
import {
  restartGame,
  useCanUndo,
  useGameFinishedAt,
  useGameFinishSubscription,
  useGameMetaStore,
  useGameStartedAt,
  useGameStateStore,
  usePuzzleNumber,
  useShouldDisplayTimer,
} from "~/fsd/app/stores";
import { Button } from "~/fsd/shared/ui/button";
import { Board } from "./ui/board";
import { congratulations } from "./ui/congratulations";
import { GameInstructions } from "./ui/game-instructions";
import { Header } from "./ui/header";
import { SettingsMenu } from "./ui/settings-menu";
import { Timer } from "./ui/timer";

export const GamePage = () => {
  // Set up game finish detection
  useGameFinishSubscription();

  // Засекаем время первой партии при открытии страницы
  useEffect(() => {
    const { gameStartedAt, startGame } = useGameMetaStore.getState();
    if (gameStartedAt === 0) startGame();
  }, []);

  const gameStartedAt = useGameStartedAt();
  const gameFinishedAt = useGameFinishedAt();
  const puzzleNumber = usePuzzleNumber();
  const gameStatus = gameFinishedAt > 0 ? "finished" : "playing";

  const shouldDisplayTimer = useShouldDisplayTimer();
  const isClient = useIsClient();
  // Номер выбирается случайно, а настройки лежат в localStorage — сервер не знает ни того, ни другого.
  // До старта партии на клиенте держим блок невидимым (место занято), а таймер рисуем как на сервере,
  // чтобы гидратация совпала и шапка не прыгала
  const isHeaderReady = isClient && gameStartedAt > 0;
  const showTimer = isClient ? shouldDisplayTimer : true;
  const canUndo = useCanUndo();

  const { cellRestored, boardCleared, boardSolved } = useGameStateStore();

  const handleClearClick = () => {
    boardCleared();
  };

  const handleUndoClick = () => {
    cellRestored();
  };

  const handleRestartClick = () => {
    restartGame();
  };

  const handleSolveClick = () => {
    boardSolved();
  };

  const randomCongratulation = pickRandom(congratulations);

  return (
    // В альбомной ориентации телефона: доска слева на всю высоту, остальное колонкой справа
    <main className="flex w-[22.375rem] max-w-full flex-col items-stretch gap-4 landscape-short:grid landscape-short:w-[46.25rem] landscape-short:grid-cols-2 landscape-short:grid-rows-[auto_auto_1fr_auto] landscape-short:gap-x-6">
      {/* Три колонки, чтобы номер с таймером стоял ровно по центру при разном числе кнопок по краям */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center text-[0.8125rem] font-bold tracking-[0.14em] text-haze landscape-short:col-start-2 landscape-short:row-start-1">
        <div className="flex gap-2">
          <Button size="icon" onClick={handleRestartClick} aria-label="Restart">
            <RotateCcw />
          </Button>
        </div>
        <div
          className={cn(
            "flex items-center gap-2.5 tabular-nums",
            !isHeaderReady && "invisible",
          )}
        >
          <span>
            #{String(isHeaderReady ? puzzleNumber : 0).padStart(4, "0")}
          </span>
          {showTimer && <Timer key={gameStartedAt} />}
        </div>
        <div className="flex justify-end gap-2">
          <GameInstructions />
          <SettingsMenu />
        </div>
      </div>

      <Header className="landscape-short:col-start-2 landscape-short:row-start-2" />

      <Board
        key={gameStartedAt}
        className="landscape-short:col-start-1 landscape-short:row-span-full"
      />

      {gameStatus === "playing" && (
        <div className="grid grid-cols-4 gap-2.5 landscape-short:col-start-2 landscape-short:row-start-4">
          <Button onClick={handleUndoClick} disabled={!canUndo}>
            <Undo2 />
            Undo
          </Button>
          <Button variant="accent">
            <Lightbulb />
            Hint
          </Button>
          <Button onClick={handleClearClick} disabled={!canUndo}>
            <Eraser />
            Clear
          </Button>
          <Button onClick={handleSolveClick}>
            <WandSparkles />
            Solve
          </Button>
        </div>
      )}

      {gameStatus === "finished" && (
        // Поздравление занимает ту же сетку, что и кнопки, — высота экрана не меняется
        <div className="grid grid-cols-4 gap-2.5 landscape-short:col-start-2 landscape-short:row-start-4">
          <div className="col-span-3 flex flex-col justify-center gap-0.5">
            <h2 className="text-lg leading-6 font-extrabold text-white">
              {randomCongratulation.title}
            </h2>
            <p className="text-[0.8125rem] leading-[1.125rem] text-mist">
              {randomCongratulation.subtitle}
            </p>
          </div>
          <Button variant="accent" onClick={handleRestartClick}>
            <Sparkles />
            Play Again
          </Button>
        </div>
      )}
    </main>
  );
};
