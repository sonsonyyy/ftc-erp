"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import {
  DayFlag,
  DayPicker,
  getDefaultClassNames,
  SelectionState,
  type DayPickerProps,
  UI,
} from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()
  const isRangeMode = props.mode === "range"

  return (
    <DayPicker
      navLayout="around"
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background p-4 [--cell-size:2.25rem] sm:[--cell-size:2.5rem]",
        className
      )}
      classNames={{
        [UI.Root]: cn("w-fit", defaultClassNames[UI.Root]),
        [UI.Months]: cn(
          "flex flex-col gap-4 sm:flex-row sm:gap-4",
          defaultClassNames[UI.Months]
        ),
        [UI.Month]: cn("relative space-y-4", defaultClassNames[UI.Month]),
        [UI.MonthCaption]: cn(
          "relative flex h-10 items-center justify-center px-10",
          defaultClassNames[UI.MonthCaption]
        ),
        [UI.CaptionLabel]: cn(
          "text-sm font-medium",
          defaultClassNames[UI.CaptionLabel]
        ),
        [UI.Nav]: cn(
          "hidden",
          defaultClassNames[UI.Nav]
        ),
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "absolute top-0 left-0 z-20 size-10 rounded-md bg-transparent p-0 opacity-100 hover:bg-muted",
          defaultClassNames[UI.PreviousMonthButton]
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "absolute top-0 right-0 z-20 size-10 rounded-md bg-transparent p-0 opacity-100 hover:bg-muted",
          defaultClassNames[UI.NextMonthButton]
        ),
        [UI.MonthGrid]: cn("w-full border-collapse", defaultClassNames[UI.MonthGrid]),
        [UI.Weekdays]: cn("flex", defaultClassNames[UI.Weekdays]),
        [UI.Weekday]: cn(
          "w-(--cell-size) rounded-md text-[0.8rem] font-normal text-muted-foreground",
          defaultClassNames[UI.Weekday]
        ),
        [UI.Weeks]: cn("mt-2 flex flex-col gap-1", defaultClassNames[UI.Weeks]),
        [UI.Week]: cn("flex w-full", defaultClassNames[UI.Week]),
        [UI.Day]: cn(
          "relative size-(--cell-size) overflow-hidden p-0 text-center text-sm focus-within:relative focus-within:z-20",
          isRangeMode
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
          defaultClassNames[UI.Day]
        ),
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-(--cell-size) rounded-md p-0 font-normal aria-selected:opacity-100",
          defaultClassNames[UI.DayButton]
        ),
        [SelectionState.selected]: cn(
          "[&_button]:rounded-md [&_button]:bg-primary [&_button]:text-primary-foreground [&_button:hover]:bg-primary [&_button:focus]:bg-primary",
          defaultClassNames[SelectionState.selected]
        ),
        [SelectionState.range_start]: cn(
          "day-range-start rounded-l-md bg-primary/15 [&_button]:rounded-md [&_button]:bg-primary [&_button]:text-primary-foreground [&_button:hover]:bg-primary [&_button:focus]:bg-primary",
          defaultClassNames[SelectionState.range_start]
        ),
        [SelectionState.range_middle]: cn(
          "bg-primary/15 text-foreground [&_button]:rounded-none [&_button]:bg-transparent [&_button]:text-foreground [&_button:hover]:bg-transparent [&_button:focus]:bg-transparent",
          defaultClassNames[SelectionState.range_middle]
        ),
        [SelectionState.range_end]: cn(
          "day-range-end rounded-r-md bg-primary/15 [&_button]:rounded-md [&_button]:bg-primary [&_button]:text-primary-foreground [&_button:hover]:bg-primary [&_button:focus]:bg-primary",
          defaultClassNames[SelectionState.range_end]
        ),
        [DayFlag.today]: cn(
          "bg-accent text-accent-foreground",
          defaultClassNames[DayFlag.today]
        ),
        [DayFlag.outside]: cn(
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          defaultClassNames[DayFlag.outside]
        ),
        [DayFlag.disabled]: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames[DayFlag.disabled]
        ),
        [DayFlag.hidden]: cn("invisible", defaultClassNames[DayFlag.hidden]),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeftIcon
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ) : (
            <ChevronRightIcon
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
