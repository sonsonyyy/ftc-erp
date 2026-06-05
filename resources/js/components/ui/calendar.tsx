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
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background p-3 [--cell-size:2.25rem] sm:[--cell-size:2.5rem]",
        className
      )}
      classNames={{
        [UI.Root]: cn("w-fit", defaultClassNames[UI.Root]),
        [UI.Months]: cn(
          "flex flex-col gap-4 sm:flex-row sm:gap-6",
          defaultClassNames[UI.Months]
        ),
        [UI.Month]: cn("space-y-4", defaultClassNames[UI.Month]),
        [UI.MonthCaption]: cn(
          "relative flex h-7 items-center justify-center px-8",
          defaultClassNames[UI.MonthCaption]
        ),
        [UI.CaptionLabel]: cn(
          "text-sm font-medium",
          defaultClassNames[UI.CaptionLabel]
        ),
        [UI.Nav]: cn(
          "absolute inset-x-0 top-0 flex items-center justify-between",
          defaultClassNames[UI.Nav]
        ),
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-7 rounded-md bg-transparent p-0 opacity-70 hover:opacity-100",
          defaultClassNames[UI.PreviousMonthButton]
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-7 rounded-md bg-transparent p-0 opacity-70 hover:opacity-100",
          defaultClassNames[UI.NextMonthButton]
        ),
        [UI.Weekdays]: cn("flex", defaultClassNames[UI.Weekdays]),
        [UI.Weekday]: cn(
          "w-(--cell-size) rounded-md text-[0.8rem] font-normal text-muted-foreground",
          defaultClassNames[UI.Weekday]
        ),
        [UI.Week]: cn("mt-1 flex w-full", defaultClassNames[UI.Week]),
        [UI.Day]: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          isRangeMode
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
          defaultClassNames[UI.Day]
        ),
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-(--cell-size) p-0 font-normal aria-selected:opacity-100",
          defaultClassNames[UI.DayButton]
        ),
        [SelectionState.range_start]: cn(
          "day-range-start rounded-l-md bg-accent",
          defaultClassNames[SelectionState.range_start]
        ),
        [SelectionState.range_end]: cn(
          "day-range-end rounded-r-md bg-accent",
          defaultClassNames[SelectionState.range_end]
        ),
        [SelectionState.range_middle]: cn(
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
          defaultClassNames[SelectionState.range_middle]
        ),
        [SelectionState.selected]: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          defaultClassNames[SelectionState.selected]
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
