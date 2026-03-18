import * as React from "react";
import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-14 w-full rounded-2xl border bg-white px-5 text-base shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400",
        className,
      )}
      {...props}
    />
  );
});

