import { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa6";
import {
  useGameFinishedAt,
  useGameStartedAt,
  useShouldDisplayTimer,
} from "~/fsd/app/stores";
import { useIsClient } from "~/fsd/shared/hooks/use-is-client";
import { formatElapsedTime } from "~/fsd/shared/lib/utils";

export const Timer = () => {
  const shouldDisplayTimer = useShouldDisplayTimer();
  const gameStartedAt = useGameStartedAt();
  const gameFinishedAt = useGameFinishedAt();
  const isClient = useIsClient();
  const [now, setNow] = useState(0);

  const isRunning = isClient && gameStartedAt > 0 && gameFinishedAt === 0;

  // Тикаем раз в секунду, только пока игра активна
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // На сервере и до старта игры показываем нулевое время,
  // после завершения — финальное
  let elapsedTime = 0;
  if (isClient && gameStartedAt > 0) {
    elapsedTime =
      gameFinishedAt > 0
        ? gameFinishedAt - gameStartedAt
        : Math.max(0, now - gameStartedAt);
  }
  const timerString = formatElapsedTime(elapsedTime);

  // Не показываем таймер если настройка отключена
  if (!shouldDisplayTimer) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <FaRegClock />
      <span>{timerString}</span>
    </div>
  );
};
