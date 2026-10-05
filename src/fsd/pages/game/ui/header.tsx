import { Sparkle } from "./sparkle";

// Эмблема-затмение: солнце, которое наполовину закрывает луна
const EclipseEmblem = () => (
  <div className="relative mt-1 size-[120px]" aria-hidden="true">
    <div className="absolute top-4 left-2.5 size-[92px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffe2c2,var(--peach)_60%,#e88a52)] shadow-[0_0_30px_rgb(246_168_99/0.7),0_0_80px_rgb(246_168_99/0.35)]" />
    <div className="absolute top-2 left-6 size-[92px] rounded-full bg-[radial-gradient(circle_at_70%_30%,#3b347f,var(--night)_70%)] shadow-[inset_3px_-2px_0_rgb(201_179_247/0.55),0_0_18px_rgb(201_179_247/0.35)]" />
    <Sparkle className="absolute top-1.5 -right-1.5 size-3.5" />
    <Sparkle className="absolute top-1 -left-0.5 size-2" />
  </div>
);

export const Header = () => {
  return (
    <div className="flex flex-col items-center">
      <EclipseEmblem />
      <h1 className="relative -mt-9 px-4 font-script text-[60px] leading-[1.3] text-white [text-shadow:0_0_24px_rgb(201_179_247/0.6),0_2px_0_rgb(38_33_89/0.6)]">
        Eclipse
      </h1>
      <p className="mt-0.5 text-[11px] font-extrabold tracking-[0.42em] text-haze">
        FIND THE BALANCE
      </p>
    </div>
  );
};
