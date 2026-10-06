import {
  generateHardGame,
  type Board,
  type BoardSize,
  type Solution,
} from "./model";
import type { GeneratorRequest } from "./game-generator.worker";

export type Game = { puzzle: Board; solution: Solution };

type Job = { size: BoardSize; resolve: (game: Game) => void };

const jobs = new Map<number, Job>();
let nextJobId = 0;
// undefined — воркер ещё не создавали, null — воркеры недоступны или воркер не загрузился
let worker: Worker | null | undefined;

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  if (typeof Worker === "undefined") return (worker = null);

  worker = new Worker(new URL("./game-generator.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.addEventListener(
    "message",
    (event: MessageEvent<{ id: number; game: Game }>) => {
      const { id, game } = event.data;
      jobs.get(id)?.resolve(game);
      jobs.delete(id);
    },
  );
  // Например, офлайн, когда скрипт воркера ещё не попал в кэш: досчитываем в основном потоке
  worker.addEventListener("error", () => {
    worker?.terminate();
    worker = null;
    for (const { size, resolve } of jobs.values()) {
      resolve(generateHardGame(size));
    }
    jobs.clear();
  });
  return worker;
}

function generate(size: BoardSize): Promise<Game> {
  const generator = getWorker();
  if (!generator) return Promise.resolve(generateHardGame(size));

  const id = nextJobId++;
  return new Promise((resolve) => {
    jobs.set(id, { size, resolve });
    generator.postMessage({ id, size } satisfies GeneratorRequest);
  });
}

// Следующая партия, подобранная заранее: перезапуск с тем же размером доски не ждёт подбора
const prefetched = new Map<BoardSize, Promise<Game>>();

/**
 * Функция requestGame выдаёт сложную головоломку, подобранную в веб-воркере,
 * и сразу заказывает следующую того же размера.
 * Воркер обрабатывает заказы по очереди, поэтому запасная партия не задерживает текущую.
 * Без воркеров (тесты, старые браузеры) подбирает в основном потоке и про запас не считает.
 *
 * @param size - сторона доски
 * @returns головоломка вместе с решением.
 */
export function requestGame(size: BoardSize): Promise<Game> {
  const game = prefetched.get(size) ?? generate(size);
  prefetched.delete(size);
  if (getWorker()) {
    prefetched.set(size, generate(size));
  }
  return game;
}
