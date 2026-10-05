import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/fsd/shared/ui/accordion";
import React from "react";
import { FaEquals, FaXmark } from "react-icons/fa6";
import { MoonGlyph, SunGlyph } from "./glyphs";

const glyphClassName = "inline size-[1.25em] align-[-0.3em]";
const Sun = () => <SunGlyph className={glyphClassName} />;
const Moon = () => <MoonGlyph className={glyphClassName} />;

export const GameInstructions = () => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1" className="border-0">
        <AccordionTrigger className="mx-auto flex-none items-center gap-2 py-2 text-[13px] font-bold tracking-[0.12em] text-haze uppercase hover:text-white hover:no-underline">
          How to play
        </AccordionTrigger>
        <AccordionContent className="px-1 pt-1.5 text-sm leading-relaxed text-mist">
          <ul className="flex list-outside list-disc flex-col gap-3 pl-4 marker:text-sky">
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
              Cells separated by an <FaEquals className="inline text-sky" />{" "}
              sign must be of the same type.
            </li>
            <li>
              Cells separated by an <FaXmark className="inline text-sky" /> sign
              must be of the opposite type.
            </li>
            <li>
              Each puzzle has one right answer and can be solved via deduction
              (you should never have to make a guess).
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
