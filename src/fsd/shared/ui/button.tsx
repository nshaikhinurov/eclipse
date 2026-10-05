type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const Button = ({ children, ...rest }: ButtonProps) => {
  return (
    <button
      className="flex items-center justify-center gap-1 rounded-full bg-white px-4 py-2 font-bold text-neutral-700 inset-ring inset-ring-neutral-700 transition-all duration-250 ease-in-out hover:bg-stone-100 hover:text-black hover:inset-ring-2 hover:inset-ring-black active:bg-stone-200 active:inset-ring-2 active:inset-ring-black disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:inset-ring-0"
      {...rest}
    >
      {children}
    </button>
  );
};
