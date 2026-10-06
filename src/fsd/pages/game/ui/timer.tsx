import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useGameFinishedAt, useGameStartedAt } from "~/fsd/app/stores";
import { useIsClient } from "~/fsd/shared/hooks/use-is-client";
import { formatElapsedTime } from "~/fsd/shared/lib/utils";

export const Timer = () => {
  const gameStartedAt = useGameStartedAt();
  const gameFinishedAt = useGameFinishedAt();
  const isClient = useIsClient();
  // Целые секунды с начала партии: пока цифра та же, React пропускает перерисовку
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isRunning = isClient && gameStartedAt > 0 && gameFinishedAt === 0;

  // Тикаем чаще секунды, чтобы цифра менялась вовремя, — только пока игра активна
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(
      () =>
        setElapsedSeconds(
          Math.max(0, Math.floor((Date.now() - gameStartedAt) / 1000)),
        ),
      250,
    );

    return () => clearInterval(interval);
  }, [isRunning, gameStartedAt]);

  // На сервере и до старта игры показываем нулевое время,
  // после завершения — финальное
  let elapsedTime = 0;
  if (isClient && gameStartedAt > 0) {
    elapsedTime =
      gameFinishedAt > 0
        ? gameFinishedAt - gameStartedAt
        : elapsedSeconds * 1000;
  }
  const timerString = formatElapsedTime(elapsedTime);

  return (
    <span className="inline-flex items-center gap-2.5">
      <Clock className="size-4 text-peach" />
      <span>{timerString}</span>
    </span>
  );
};
