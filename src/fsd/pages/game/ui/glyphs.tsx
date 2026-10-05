import { cn } from "~/fsd/shared/lib/utils";

type GlyphProps = {
  className?: string;
};

export const SunGlyph = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 40 40" aria-label="Sun" className={cn("text-peach", className)}>
    <circle cx="20" cy="20" r="12" fill="currentColor" />
    <circle
      cx="20"
      cy="20"
      r="16"
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.35"
      strokeWidth="1.2"
    />
  </svg>
);

// Полумесяц: круг r=12 с вырезанным кругом r=11.5, смещённым вправо-вверх
export const MoonGlyph = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 40 40" aria-label="Moon" className={cn("text-lilac", className)}>
    <path
      d="M16.17 8.62A12 12 0 1 0 30.26 26.23 11.5 11.5 0 0 1 16.17 8.62Z"
      fill="currentColor"
    />
    <circle
      cx="20"
      cy="20"
      r="16"
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.35"
      strokeWidth="1.2"
    />
  </svg>
);

// Символы в строке текста: чуть крупнее буквы и выровнены по её середине
const inlineGlyphClassName = "inline size-[1.25em] align-[-0.3em]";
export const InlineSun = () => <SunGlyph className={inlineGlyphClassName} />;
export const InlineMoon = () => <MoonGlyph className={inlineGlyphClassName} />;
