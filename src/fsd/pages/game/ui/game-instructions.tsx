import { CircleQuestionMark, Pointer, X } from "lucide-react";
import { useRef } from "react";
import { useSettingsStore } from "~/fsd/app/stores";
import { Button } from "~/fsd/shared/ui/button";
import { InlineMoon as Moon, InlineSun as Sun } from "./glyphs";

// Правила в модалке на нативном <dialog>: фокус, Esc и затемнение фона даёт браузер
export const GameInstructions = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  const handleTutorialClick = () => {
    close();
    useSettingsStore.getState().startTutorial();
  };

  return (
    <>
      <Button size="icon" onClick={open} aria-label="How to play">
        <CircleQuestionMark />
      </Button>
      {/* Клик по подложке (вне панели) закрывает модалку; с клавиатуры то же делает Esc */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        aria-labelledby="how-to-play-title"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto max-h-[calc(100svh-2rem)] w-[22.375rem] max-w-[calc(100vw-2rem)] [scrollbar-width:thin] [scrollbar-color:var(--color-lilac)_transparent] overflow-y-auto overscroll-contain rounded-[1.625rem] border border-lilac/20 bg-ink text-foreground shadow-[0_1.5rem_4rem_rgb(0_0_0/0.45)] backdrop:bg-night/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <h2
              id="how-to-play-title"
              className="text-[0.8125rem] font-bold tracking-[0.12em] text-haze uppercase"
            >
              How to play
            </h2>
            <Button size="icon" onClick={close} aria-label="Close">
              <X />
            </Button>
          </div>
          <ul className="flex list-outside list-disc flex-col gap-3 pl-4 text-sm leading-relaxed text-mist marker:text-sky">
            <li>
              Fill the grid so that each cell contains either a <Sun /> or a{" "}
              <Moon />.
            </li>
            <li>
              <p className="mb-3">
                No more than 2 <Sun /> or <Moon /> may be next to each other,
                either vertically or horizontally.
              </p>
              <ul className="flex list-outside list-disc flex-col gap-3 pl-4 marker:text-sky">
                <li>
                  <Sun />
                  <Sun />
                  <Sun /> ❌
                </li>
                <li>
                  <Sun />
                  <Sun /> ✔️
                </li>
              </ul>
            </li>
            <li>
              Each row (and column) must contain the same number of <Sun /> and{" "}
              <Moon />.
            </li>
            <li>Each row (and column) must be unique.</li>
            <li>
              Each puzzle has one right answer and can be solved via deduction
              (you should never have to make a guess).
            </li>
          </ul>
          <Button
            size="pill"
            className="self-center"
            onClick={handleTutorialClick}
          >
            <Pointer />
            Show tutorial
          </Button>
        </div>
      </dialog>
    </>
  );
};
