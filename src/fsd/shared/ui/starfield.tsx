"use client";

import { useSyncExternalStore } from "react";

const STAR_COUNT = 220;

type Star = {
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  appear: number;
  glow: boolean;
};

const generateStars = (): Star[] =>
  Array.from({ length: STAR_COUNT }, () => {
    // Кубическое распределение: большинство звёзд мелкие, крупных единицы
    const size = 0.8 + Math.random() ** 3 * 2.2;
    return {
      left: Math.random() * 100,
      top: Math.random() * 100,
      size,
      opacity: 0.35 + Math.random() * 0.55,
      duration: 2.5 + Math.random() * 4.5,
      delay: -Math.random() * 7,
      appear: 0.5 + Math.random() * 2.5,
      glow: size > 2,
    };
  });

// Небо генерируется только на клиенте, один раз за загрузку страницы
let clientStars: Star[] | null = null;
const noStars: Star[] = [];

const subscribe = () => () => {};
const getSnapshot = () => (clientStars ??= generateStars());
const getServerSnapshot = () => noStars;

export const Starfield = () => {
  const stars = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {stars.map((star, index) => (
        // Обёртка плавно проявляет звезду, сама звезда мерцает
        <span
          key={index}
          className="star-appear absolute"
          style={
            {
              left: `${star.left}%`,
              top: `${star.top}%`,
              "--appear-duration": `${star.appear}s`,
            } as React.CSSProperties
          }
        >
          <span
            className="star block rounded-full bg-white"
            style={
              {
                width: star.size,
                height: star.size,
                boxShadow: star.glow
                  ? `0 0 ${star.size * 2}px rgb(201 179 247 / 0.8)`
                  : undefined,
                "--star-opacity": star.opacity,
                "--twinkle-duration": `${star.duration}s`,
                "--twinkle-delay": `${star.delay}s`,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
};
