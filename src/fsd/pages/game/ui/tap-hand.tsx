import { motion } from "motion/react";
import { FaHandPointer } from "react-icons/fa6";
import { type CellValue, getNextValue } from "../model";

// Сколько тапов отделяет текущее значение клетки от нужного
export const countTaps = (from: CellValue, to: CellValue) => {
  let taps = 0;
  for (let value = from; value !== to; value = getNextValue(value)) taps++;
  return taps;
};

type Frame = {
  at: number;
  opacity: number;
  x: number;
  y: number;
  scale: number;
};

// Раскадровка пальца: подлетает снизу справа, жмёт нужное число раз, уходит
const buildHandFrames = (taps: number) => {
  const frames: Frame[] = [{ at: 0, opacity: 0, x: 14, y: 20, scale: 1 }];
  const pressedAt: number[] = [];
  let at = 0.45;
  frames.push({ at, opacity: 1, x: 0, y: 0, scale: 1 });
  for (let i = 0; i < taps; i++) {
    at += 0.15;
    frames.push({ at, opacity: 1, x: 0, y: 0, scale: 0.8 });
    pressedAt.push(at);
    at += 0.15;
    frames.push({ at, opacity: 1, x: 0, y: 0, scale: 1 });
  }
  at += 0.5;
  frames.push({ at, opacity: 1, x: 0, y: 0, scale: 1 });
  at += 0.3;
  frames.push({ at, opacity: 0, x: 8, y: 12, scale: 1 });
  return { frames, pressedAt, duration: at };
};

const HAND_REPEAT_DELAY = 0.6;

export const TapHand = ({ taps }: { taps: number }) => {
  const { frames, pressedAt, duration } = buildHandFrames(taps);
  const transition = {
    duration,
    times: frames.map((frame) => frame.at / duration),
    repeat: Infinity,
    repeatDelay: HAND_REPEAT_DELAY,
    ease: "easeInOut" as const,
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Круги от касаний, по одному на каждый тап */}
      {pressedAt.map((at) => (
        <motion.span
          key={at}
          className="absolute inset-0 rounded-full border-2 border-white/70"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0, 0.9, 0], scale: [0.4, 0.4, 0.55, 1.25] }}
          transition={{
            duration,
            times: [
              0,
              at / duration,
              (at + 0.02) / duration,
              (at + 0.4) / duration,
            ],
            repeat: Infinity,
            repeatDelay: HAND_REPEAT_DELAY,
          }}
        />
      ))}
      {/* Кончик указательного пальца иконки — на 37.5% ширины от левого края */}
      <div className="absolute top-1/2 left-1/2 -translate-x-[37.5%]">
        <motion.div
          className="origin-top"
          initial={{ opacity: 0 }}
          animate={{
            opacity: frames.map((frame) => frame.opacity),
            x: frames.map((frame) => frame.x),
            y: frames.map((frame) => frame.y),
            scale: frames.map((frame) => frame.scale),
          }}
          transition={transition}
        >
          <FaHandPointer className="h-8 w-7 text-white drop-shadow-[0_0.25rem_0.5rem_rgb(0_0_0/0.5)]" />
        </motion.div>
      </div>
    </div>
  );
};
