import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { type BoardSize } from "~/fsd/pages/game/model";

type SettingsState = {
  shouldDisplayTimer: boolean;
  boardSize: BoardSize;
  // Новичку при первом заходе показываем обучение
  hasSeenTutorial: boolean;
  // Actions
  toggleTimerDisplay: () => void;
  setBoardSize: (boardSize: BoardSize) => void;
  startTutorial: () => void;
  finishTutorial: () => void;
  updateSettings: (
    settings: Partial<{
      shouldDisplayTimer: boolean;
    }>,
  ) => void;
};

// Create the settings store with persistence
export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set) => ({
      shouldDisplayTimer: true,
      boardSize: 6,
      hasSeenTutorial: false,

      toggleTimerDisplay: () =>
        set((state) => {
          state.shouldDisplayTimer = !state.shouldDisplayTimer;
        }),

      setBoardSize: (boardSize) =>
        set((state) => {
          state.boardSize = boardSize;
        }),

      startTutorial: () =>
        set((state) => {
          state.hasSeenTutorial = false;
        }),

      finishTutorial: () =>
        set((state) => {
          state.hasSeenTutorial = true;
        }),

      updateSettings: (settings) =>
        set((state) => {
          if (settings.shouldDisplayTimer !== undefined) {
            state.shouldDisplayTimer = settings.shouldDisplayTimer;
          }
        }),
    })),
    {
      name: "eclipse-settings",
    },
  ),
);

// Hook selectors
export const useShouldDisplayTimer = () =>
  useSettingsStore((state) => state.shouldDisplayTimer);

export const useBoardSize = () => useSettingsStore((state) => state.boardSize);

export const useHasSeenTutorial = () =>
  useSettingsStore((state) => state.hasSeenTutorial);
