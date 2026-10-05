"use client";

import { pickRandom } from "~/fsd/shared/lib/utils";
import {
  FaArrowLeft,
  FaBolt,
  FaBrain,
  FaBroom,
  FaLightbulb,
  FaRotateRight,
} from "react-icons/fa6";
import {
  restartGame,
  useCanUndo,
  useGameFinishedAt,
  useGameFinishSubscription,
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

  const gameStartedAt = useGameStartedAt();
  const gameFinishedAt = useGameFinishedAt();
  const gameStatus = gameFinishedAt > 0 ? "finished" : "playing";
  console.log("🚀 ~ GamePage ~ GamePage rendered");

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
    <main className="flex w-full max-w-[400px] flex-col items-stretch gap-4 rounded-md bg-stone-100 p-4 text-black sm:w-[452px]">
      <Header
        actionsSlot={<SettingsMenu triggerClassName="absolute top-0 right-0" />}
      />

      <>
        <div className="grid grid-cols-3 grid-rows-1 items-center justify-center gap-2 font-semibold">
          <div className="text-center">Puzzle #976</div>
          <div className="flex items-center justify-center gap-2">
            {shouldDisplayTimer && <Timer key={gameStartedAt} />}
          </div>
          <Button onClick={handleRestartClick}>
            <FaRotateRight /> Restart
          </Button>
        </div>

        <Board key={gameStartedAt} />

        {gameStatus === "playing" && (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleUndoClick} disabled={!canUndo}>
              <FaArrowLeft />
              Undo
            </Button>
            <Button>
              <FaLightbulb /> Hint
            </Button>
            <Button onClick={handleClearClick} disabled={!canUndo}>
              <FaBroom /> Clear
            </Button>
            <Button onClick={handleSolveClick}>
              <FaBolt /> Solve
            </Button>
          </div>
        )}
      </>

      {gameStatus === "finished" && (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-2xl font-bold">{randomCongratulation.title}</h2>
          <p className="text-lg">{randomCongratulation.subtitle}</p>
          <Button onClick={handleRestartClick}>
            <FaBrain /> Play Again
          </Button>
        </div>
      )}

      <GameInstructions />
    </main>
  );
};
