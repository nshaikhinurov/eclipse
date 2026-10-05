import { useGameMetaStore } from "./game-meta";
import { useGameStateStore } from "./game-state";

// Re-export everything from individual store files
export * from "./game-meta";
export * from "./game-state";
export * from "./settings";

// Create a coordinator function to restart the game
export const restartGame = () => {
  const { resetMeta } = useGameMetaStore.getState();
  const { resetGame } = useGameStateStore.getState();

  // Reset meta first to avoid subscription issues
  resetMeta();
  resetGame();
};
