import { cn } from "~/fsd/shared/lib/utils";

export const Sparkle = ({
  className,
  ...rest
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={cn("text-white", className)}
    {...rest}
  >
    <path
      d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z"
      fill="currentColor"
    />
  </svg>
);
