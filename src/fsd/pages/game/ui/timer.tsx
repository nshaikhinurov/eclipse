import { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa6";
import {
  useGameFinishedAt,
  useGameStartedAt,
  useShouldDisplayTimer,
} from "~/fsd/app/stores";
import { formatElapsedTime } from "~/fsd/shared/lib/utils";

export const Timer = () => {
  const shouldDisplayTimer = useShouldDisplayTimer();
  const gameStartedAt = useGameStartedAt();
  const gameFinishedAt = useGameFinishedAt();
  const [currentTime, setCurrentTime] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Устанавливаем флаг что мы на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Обновляем текущее время каждую секунду, только если игра активна
  useEffect(() => {
    if (!isClient || gameStartedAt === 0) return;

    // Если игра завершена, показываем финальное время
    if (gameFinishedAt > 0) {
      setCurrentTime(gameFinishedAt - gameStartedAt);
      return;
    }

    // Обновляем время каждую секунду для активной игры
    const updateTime = () => {
      setCurrentTime(Date.now() - gameStartedAt);
    };

    // Обновляем сразу
    updateTime();

    // Затем каждую секунду
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [gameStartedAt, gameFinishedAt, isClient]);

  // На сервере показываем дефолтное время
  const displayTime = isClient ? currentTime : 0;
  const timerString = formatElapsedTime(displayTime);

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
