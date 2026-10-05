import { useEffect } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { isGameFinished, useGameStateStore } from "./game-state";

type GameMetaState = {
  gameStartedAt: number;
  gameFinishedAt: number;
  // Actions
  startGame: () => void;
  finishGame: () => void;
  resetMeta: () => void;
};

// Create the game meta store
export const useGameMetaStore = create<GameMetaState>()(
  immer((set) => ({
    gameStartedAt: 0,
    gameFinishedAt: 0,

    startGame: () => {
      set({ gameStartedAt: Date.now(), gameFinishedAt: 0 });
    },

    finishGame: () => {
      set({ gameFinishedAt: Date.now() });
    },

    resetMeta: () => {
      set({ gameStartedAt: Date.now(), gameFinishedAt: 0 });
    },
  })),
);

// Hook to set up game finish detection
export const useGameFinishSubscription = () => {
  useEffect(() => {
    let prevFinished = false;
    let subscriptionCount = 0;

    const unsubscribe = useGameStateStore.subscribe((state) => {
      subscriptionCount++;
      const finished = isGameFinished(state);
      const metaState = useGameMetaStore.getState();

      // Debug logging
      console.log(`Subscription call #${subscriptionCount}:`, {
        finished,
        prevFinished,
        gameFinishedAt: metaState.gameFinishedAt,
        shouldFinish:
          finished && !prevFinished && metaState.gameFinishedAt === 0,
      });

      // Only update when the game transitions to finished state
      if (finished && !prevFinished && metaState.gameFinishedAt === 0) {
        console.log("Calling finishGame()");
        metaState.finishGame();
      }

      prevFinished = finished;
    });

    return unsubscribe;
  }, []);
};

export const isGameActive = (state: GameMetaState) => {
  return state.gameFinishedAt === 0;
};

// Hook selectors
export const useGameStartedAt = () =>
  useGameMetaStore((state) => state.gameStartedAt);
export const useGameFinishedAt = () =>
  useGameMetaStore((state) => state.gameFinishedAt);
export const useIsGameActive = () => useGameMetaStore(isGameActive);
