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

// Hook to set up game finish detection.
// Читаем стор хуком, а не ручной подпиской: при горячей перезагрузке сторы создаются заново,
// и подписка из эффекта с пустыми зависимостями осталась бы на старом сторе
export const useGameFinishSubscription = () => {
  const finished = useGameStateStore(isGameFinished);

  useEffect(() => {
    const metaState = useGameMetaStore.getState();
    // Only update when the game transitions to finished state
    if (finished && metaState.gameFinishedAt === 0) {
      metaState.finishGame();
    }
  }, [finished]);
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
