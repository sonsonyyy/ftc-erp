import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
    color?: string
    theme?: {
      light?: string
      dark?: string
    }
  }
>

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (context === null) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function resolveChartColor(configItem?: ChartConfig[string]): string | undefined {
  return configItem?.color ?? configItem?.theme?.light ?? configItem?.theme?.dark
}

function ChartContainer({
  config,
  children,
  className,
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactElement
}) {
  const style = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(config).flatMap(([key, value]) => {
        const color = resolveChartColor(value)

        return color === undefined ? [] : [[`--color-${key}`, color]]
      })
    ) as React.CSSProperties
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border/60 [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/40 [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className
        )}
        style={style}
      >
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = React.ComponentProps<"div"> &
  Partial<
    RechartsPrimitive.TooltipContentProps<
      RechartsPrimitive.TooltipValueType,
      string | number
    >
  > & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "dot" | "line" | "dashed"
    labelFormatter?: (
      label: React.ReactNode,
      payload: ReadonlyArray<RechartsPrimitive.TooltipPayloadEntry>
    ) => React.ReactNode
    formatter?: (
      value: RechartsPrimitive.TooltipValueType | undefined,
      name: React.ReactNode,
      item: RechartsPrimitive.TooltipPayloadEntry,
      index: number,
      payload: ReadonlyArray<RechartsPrimitive.TooltipPayloadEntry>
    ) => React.ReactNode
  }

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      className,
      payload,
      label,
      hideIndicator = false,
      hideLabel = false,
      indicator = "dot",
      labelFormatter,
      formatter,
      ...props
    },
    ref
  ) => {
    const { config } = useChart()
    const tooltipPayload = payload as
      | ReadonlyArray<RechartsPrimitive.TooltipPayloadEntry>
      | undefined

    if (!active || tooltipPayload == null || tooltipPayload.length === 0) {
      return null
    }

    const renderedLabel =
      hideLabel || label == null
        ? null
        : labelFormatter?.(label, tooltipPayload) ?? label

    return (
      <div
        ref={ref}
        data-slot="chart-tooltip"
        className={cn(
          "bg-background/96 grid min-w-[10rem] gap-2 rounded-lg border px-3 py-2 text-xs shadow-lg backdrop-blur-xs",
          className
        )}
        {...props}
      >
        {renderedLabel !== null ? (
          <div className="font-medium text-foreground">{renderedLabel}</div>
        ) : null}

        <div className="grid gap-1.5">
          {tooltipPayload.map((item, index) => {
            const configKey = String(item.dataKey ?? item.name ?? index)
            const configItem =
              config[configKey] ??
              (typeof item.name === "string" ? config[item.name] : undefined)
            const displayName = configItem?.label ?? item.name ?? configKey
            const color =
              item.color ?? item.payload?.fill ?? resolveChartColor(configItem)
            const displayValue =
              formatter?.(
                item.value,
                displayName,
                item,
                index,
                tooltipPayload
              ) ?? item.value

            return (
              <div
                key={`${configKey}-${index}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {!hideIndicator ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-full",
                        indicator === "dot" && "size-2.5",
                        indicator === "line" && "h-2 w-3 rounded-sm",
                        indicator === "dashed" &&
                          "h-0 w-3 border-t border-dashed"
                      )}
                      style={{
                        backgroundColor:
                          indicator === "dot" || indicator === "line"
                            ? color
                            : undefined,
                        borderColor: color,
                      }}
                    />
                  ) : null}

                  <span className="truncate text-muted-foreground">
                    {displayName}
                  </span>
                </div>

                <span className="font-mono font-medium text-foreground">
                  {displayValue}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
