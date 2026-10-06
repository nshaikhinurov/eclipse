import { generateHardGame, type BoardSize } from "./model";

export type GeneratorRequest = { id: number; size: BoardSize };

// Подбор сложной головоломки занимает до полсекунды — считаем его здесь, чтобы не замирал интерфейс
self.addEventListener("message", (event: MessageEvent<GeneratorRequest>) => {
  const { id, size } = event.data;
  self.postMessage({ id, game: generateHardGame(size) });
});
