import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type SettingsState = {
  shouldDisplayTimer: boolean;
  shouldDisplayErrors: boolean;
  // Новичку при первом заходе показываем обучение
  hasSeenTutorial: boolean;
  // Actions
  toggleTimerDisplay: () => void;
  toggleErrorDisplay: () => void;
  startTutorial: () => void;
  finishTutorial: () => void;
  updateSettings: (
    settings: Partial<{
      shouldDisplayTimer: boolean;
      shouldDisplayErrors: boolean;
    }>,
  ) => void;
};

// Create the settings store with persistence
export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set) => ({
      shouldDisplayTimer: true,
      shouldDisplayErrors: true,
      hasSeenTutorial: false,

      toggleTimerDisplay: () =>
        set((state) => {
          state.shouldDisplayTimer = !state.shouldDisplayTimer;
        }),

      toggleErrorDisplay: () =>
        set((state) => {
          state.shouldDisplayErrors = !state.shouldDisplayErrors;
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
          if (settings.shouldDisplayErrors !== undefined) {
            state.shouldDisplayErrors = settings.shouldDisplayErrors;
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

export const useShouldDisplayErrors = () =>
  useSettingsStore((state) => state.shouldDisplayErrors);

export const useHasSeenTutorial = () =>
  useSettingsStore((state) => state.hasSeenTutorial);
