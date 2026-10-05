import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/fsd/shared/ui/accordion";
import React from "react";
import { FaEquals, FaXmark } from "react-icons/fa6";

export const GameInstructions = () => {
  return (
    <Accordion
      type="single"
      className="inset-ring inset-ring-stone-300 rounded-sm px-4 bg-stone-50"
      collapsible
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>How to play?</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc list-outside pl-4 flex flex-col gap-3 text-justify">
            <li>
              Fill the grid so that each cell contains either a ☀️ or a 🌙.
            </li>
            <li>
              <p className="mb-3">
                No more than 2 ☀️ or 🌙 may be next to each other, either
                vertically or horizontally.
              </p>
              <ul className="list-disc list-outside pl-4 flex flex-col gap-3">
                <li>☀️☀️☀️❌.</li>
                <li>☀️☀️✔️.</li>
              </ul>
            </li>
            <li>
              Each row (and column) must contain the same number of ☀️ and 🌙.
            </li>
            <li>Each row (and column) must be unique.</li>
            <li>
              Cells separated by an <FaEquals className="inline" /> sign must be
              of the same type.
            </li>
            <li>
              Cells separated by an <FaXmark className="inline" /> sign must be
              of the opposite type.
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
