import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/fsd/shared/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center border font-extrabold uppercase transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      variant: {
        ghost:
          "border-lilac/20 text-mist enabled:hover:border-lilac/45 enabled:hover:bg-white/5",
        accent:
          "border-peach/55 bg-peach/8 text-peach enabled:hover:bg-peach/15",
      },
      size: {
        // Плитка: иконка над подписью
        tile: "flex-col gap-[7px] rounded-[18px] pt-[13px] pb-[11px] text-[10.5px] tracking-[0.16em] [&_svg]:size-5",
        pill: "gap-2 rounded-full px-6 py-3 text-xs tracking-[0.16em] [&_svg]:size-4",
        icon: "size-[38px] shrink-0 rounded-full text-haze enabled:hover:text-white [&_svg]:size-[18px]",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "tile",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    children: React.ReactNode;
  };

export const Button = ({
  children,
  className,
  variant,
  size,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    >
      {children}
    </button>
  );
};
