import { cn } from "@/lib/utils";
import { useId } from "react";
import { CheckIcon, XIcon } from "./switch-icons";

type SwitchProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  withIcon?: boolean;
  background?: "dark" | "light";
  backgroundSize?: "sm" | "default";
  disabled?: boolean;
  name?: string;
  className?: string;
};

export function Switch({
  checked,
  onChange,
  label,
  withIcon,
  background = "light",
  backgroundSize = "default",
  disabled = false,
  name,
  className,
}: SwitchProps) {
  const id = useId();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <label
        htmlFor={id}
        className={cn("flex cursor-pointer select-none items-center", {
          "cursor-not-allowed opacity-50": disabled,
        })}
      >
        <div className="relative">
          <input
            type="checkbox"
            name={name}
            id={id}
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className="peer sr-only"
          />
          <div
            className={cn("h-8 w-14 rounded-full bg-gray-3 dark:bg-[#5A616B]", {
              "h-5": backgroundSize === "sm",
              "bg-[#212B36] dark:bg-primary": background === "dark",
            })}
          />

          <div
            className={cn(
              "absolute left-1 top-1 flex size-6 items-center justify-center rounded-full bg-white shadow-switch-1 transition peer-checked:right-1 peer-checked:translate-x-full peer-checked:[&_.check-icon]:block peer-checked:[&_.x-icon]:hidden",
              {
                "-top-1 left-0 size-7 shadow-switch-2":
                  backgroundSize === "sm",
                "peer-checked:bg-primary peer-checked:dark:bg-white":
                  background !== "dark",
              },
            )}
          >
            {withIcon && (
              <>
                <CheckIcon className="check-icon hidden fill-white dark:fill-dark" />
                <XIcon className="x-icon" />
              </>
            )}
          </div>
        </div>
      </label>
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </div>
  );
}
