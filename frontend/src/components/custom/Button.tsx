import { type ClassValue, clsx } from "clsx";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const CustomButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, isLoading, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn("", className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Spinner />}
        {children}
      </Button>
    );
  },
);

CustomButton.displayName = "Button";

export { CustomButton };
