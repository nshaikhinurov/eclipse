"use client";

import { useEffect } from "react";
import { pickRandom } from "~/fsd/shared/lib/utils";
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
  const gameStatus = gameFinishedAt > 0 ? "finished" : "playing";

  const shouldDisplayTimer = useShouldDisplayTimer();
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
    <main className="flex w-full max-w-[420px] flex-col items-stretch gap-5">
      <div className="flex items-center justify-between text-[13px] font-bold tracking-[0.14em] text-haze">
        <Button size="icon" onClick={handleRestartClick} aria-label="Restart">
          <RotateCcw />
        </Button>
        <div className="flex items-center gap-2.5 tabular-nums">
          <span>No. 976</span>
          {shouldDisplayTimer && <Timer key={gameStartedAt} />}
        </div>
        <SettingsMenu />
      </div>

      <Header />

      <Board key={gameStartedAt} />

      {gameStatus === "playing" && (
        <div className="grid grid-cols-4 gap-2.5">
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
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <h2 className="text-2xl font-extrabold text-white">
            {randomCongratulation.title}
          </h2>
          <p className="text-mist">{randomCongratulation.subtitle}</p>
          <Button
            variant="accent"
            size="pill"
            className="mt-2"
            onClick={handleRestartClick}
          >
            <Sparkles /> Play Again
          </Button>
        </div>
      )}

      <GameInstructions />
    </main>
  );
};
