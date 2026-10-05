import Image from "next/image";

export const Header = ({ actionsSlot }: { actionsSlot: React.ReactNode }) => {
  return (
    <div className="relative">
      <h1 className="flex items-center justify-center gap-2 text-2xl font-bold">
        <Image src="/favicon.svg" alt="Eclipse" width={32} height={32} />
        Eclipse
      </h1>
      <p className="text-center">
        Use your reasoning skills to harmonize the grid.
      </p>
      {actionsSlot}
    </div>
  );
};
