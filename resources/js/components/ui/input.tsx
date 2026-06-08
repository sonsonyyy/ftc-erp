import { CalendarDays } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const inputBaseClasses =
  "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-8 w-full min-w-0 rounded-md border bg-background/80 px-3 py-1 text-sm shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"

function useScrollSafeWheel(
  type: React.ComponentProps<"input">["type"],
  onWheel?: React.ComponentProps<"input">["onWheel"],
) {
  return React.useCallback(
    (event: React.WheelEvent<HTMLInputElement>) => {
      if (type === "number" && document.activeElement === event.currentTarget) {
        event.currentTarget.blur()
      }

      onWheel?.(event)
    },
    [onWheel, type]
  )
}

const DateInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, onWheel, disabled, readOnly, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const handleWheel = useScrollSafeWheel("date", onWheel)

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    function openPicker() {
      if (disabled || readOnly) {
        return
      }

      const element = inputRef.current as
        | (HTMLInputElement & { showPicker?: () => void })
        | null

      element?.focus()
      element?.showPicker?.()
    }

    return (
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="date"
          data-slot="input"
          className={cn(
            inputBaseClasses,
            "pr-9 [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            className
          )}
          onWheel={handleWheel}
          disabled={disabled}
          readOnly={readOnly}
          {...props}
        />

        <button
          type="button"
          onClick={openPicker}
          tabIndex={-1}
          aria-label="Open date picker"
          className="absolute inset-y-0 right-0 flex w-8 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          disabled={disabled}
        >
          <CalendarDays className="size-4" />
        </button>
      </div>
    )
  }
)

DateInput.displayName = "DateInput"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onWheel, ...props }, ref) => {
    const handleWheel = useScrollSafeWheel(type, onWheel)

    if (type === "date") {
      return <DateInput ref={ref} className={className} onWheel={onWheel} {...props} />
    }

    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          inputBaseClasses,
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className
        )}
        onWheel={handleWheel}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { DateInput, Input }
