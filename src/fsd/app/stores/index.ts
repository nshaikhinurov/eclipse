import { requestGame, type Game } from "~/fsd/pages/game/game-generator";
import { type BoardSize } from "~/fsd/pages/game/model";
import { useGameMetaStore } from "./game-meta";
import { useGameStateStore } from "./game-state";
import { useSettingsStore } from "./settings";

// Re-export everything from individual store files
export * from "./game-meta";
export * from "./game-state";
export * from "./settings";

// Партия, которую сейчас подбирает воркер. Повторный перезапуск с тем же размером её дожидается,
// а не заказывает ещё одну — например, когда StrictMode дважды запускает эффект старта
let pendingRestart: { size: BoardSize; game: Promise<Game> } | null = null;

// Create a coordinator function to restart the game
export const restartGame = () => {
  const size = useSettingsStore.getState().boardSize;
  if (pendingRestart?.size === size) return;

  const restart = { size, game: requestGame(size) };
  pendingRestart = restart;
  void restart.game.then((game) => {
    // Пока подбирали, игрок сменил размер доски — эта партия уже не нужна
    if (pendingRestart !== restart) return;
    pendingRestart = null;

    // Время партии отсчитываем с момента, когда доска появилась.
    // Reset meta first to avoid subscription issues
    useGameMetaStore.getState().resetMeta();
    useGameStateStore.getState().resetGame(game);
  });
};
