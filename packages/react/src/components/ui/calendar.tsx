"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale,
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "dyn:group/calendar dyn:bg-background dyn:p-2 dyn:[--cell-radius:0.5rem] dyn:[--cell-size:1.75rem]",
        String.raw`dyn:rtl:**:[.rdp-button_next>svg]:rotate-180`,
        String.raw`dyn:rtl:**:[.rdp-button_previous>svg]:rotate-180`,
        className
      )}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          locale && (locale as Locale).code
            ? date.toLocaleString((locale as Locale).code, { month: "short" })
            : date.toLocaleString(undefined, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("dyn:w-fit", defaultClassNames.root),
        months: cn(
          "dyn:relative dyn:flex dyn:flex-col dyn:gap-4 dyn:md:flex-row",
          defaultClassNames.months
        ),
        month: cn("dyn:flex dyn:w-full dyn:flex-col dyn:gap-4", defaultClassNames.month),
        nav: cn(
          "dyn:absolute dyn:inset-x-0 dyn:top-0 dyn:flex dyn:w-full dyn:items-center dyn:justify-between dyn:gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "dyn:h-8 dyn:w-8 dyn:p-0 dyn:select-none dyn:rounded-md dyn:border dyn:border-input dyn:bg-background dyn:text-foreground dyn:hover:bg-accent dyn:hover:text-accent-foreground dyn:aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "dyn:h-8 dyn:w-8 dyn:p-0 dyn:select-none dyn:rounded-md dyn:border dyn:border-input dyn:bg-background dyn:text-foreground dyn:hover:bg-accent dyn:hover:text-accent-foreground dyn:aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "dyn:flex dyn:h-[--cell-size] dyn:w-full dyn:items-center dyn:justify-center dyn:px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "dyn:flex dyn:h-[--cell-size] dyn:w-full dyn:items-center dyn:justify-center dyn:gap-1.5 dyn:text-sm dyn:font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "dyn:relative dyn:rounded-[--cell-radius]",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "dyn:absolute dyn:inset-0 dyn:bg-popover dyn:opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "dyn:font-medium dyn:select-none dyn:text-sm",
          defaultClassNames.caption_label
        ),
        table: "dyn:w-full dyn:border-collapse",
        weekdays: cn("dyn:flex", defaultClassNames.weekdays),
        weekday: cn(
          "dyn:flex-1 dyn:rounded-[--cell-radius] dyn:text-[0.8rem] dyn:font-normal dyn:text-muted-foreground dyn:select-none",
          defaultClassNames.weekday
        ),
        week: cn("dyn:mt-2 dyn:flex dyn:w-full", defaultClassNames.week),
        week_number_header: cn(
          "dyn:w-[--cell-size] dyn:select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "dyn:text-[0.8rem] dyn:text-muted-foreground dyn:select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "dyn:group/day dyn:relative dyn:aspect-square dyn:h-full dyn:w-full dyn:rounded-[--cell-radius] dyn:p-0 dyn:text-center dyn:select-none dyn:[&:last-child[data-selected=true]_button]:rounded-r-[--cell-radius]",
          props.showWeekNumber
            ? "dyn:[&:nth-child(2)[data-selected=true]_button]:rounded-l-[--cell-radius]"
            : "dyn:[&:first-child[data-selected=true]_button]:rounded-l-[--cell-radius]",
          defaultClassNames.day
        ),
        range_start: cn(
          "dyn:relative dyn:isolate dyn:z-0 dyn:rounded-l-[--cell-radius] dyn:bg-muted dyn:after:absolute dyn:after:inset-y-0 dyn:after:right-0 dyn:after:w-4 dyn:after:bg-muted",
          defaultClassNames.range_start
        ),
        range_middle: cn("dyn:rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "dyn:relative dyn:isolate dyn:z-0 dyn:rounded-r-[--cell-radius] dyn:bg-muted dyn:after:absolute dyn:after:inset-y-0 dyn:after:left-0 dyn:after:w-4 dyn:after:bg-muted",
          defaultClassNames.range_end
        ),
        today: cn(
          "dyn:rounded-[--cell-radius] dyn:bg-muted dyn:text-foreground dyn:data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "dyn:text-muted-foreground dyn:aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "dyn:text-muted-foreground dyn:opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("dyn:invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootClassName, rootRef, ...rootProps }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(rootClassName)}
            {...rootProps}
          />
        ),
        Chevron: ({ className, orientation, ...chevronProps }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("dyn:size-4", className)}
                {...chevronProps}
              />
            );
          }
          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("dyn:size-4", className)}
                {...chevronProps}
              />
            );
          }
          return (
            <ChevronDownIcon
              className={cn("dyn:size-4", className)}
              {...chevronProps}
            />
          );
        },
        DayButton: (props: React.ComponentProps<typeof DayButton>) => (
          <CalendarDayButton locale={locale as Partial<Locale> | undefined} {...props} />
        ),
        WeekNumber: ({ children, ...weekProps }) => (
          <td {...weekProps}>
            <div className="dyn:flex dyn:h-[--cell-size] dyn:w-[--cell-size] dyn:items-center dyn:justify-center dyn:text-center dyn:text-xs dyn:text-muted-foreground">
              {children}
            </div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "dyn:relative dyn:isolate dyn:z-10 dyn:flex dyn:aspect-square dyn:size-auto dyn:w-full dyn:min-w-[--cell-size] dyn:flex-col dyn:gap-1 dyn:border-0 dyn:font-normal dyn:leading-none",
        "dyn:group-data-[focused=true]/day:z-10 dyn:group-data-[focused=true]/day:border-ring dyn:group-data-[focused=true]/day:ring-[3px] dyn:group-data-[focused=true]/day:ring-ring/50",
        "dyn:data-[range-end=true]:rounded-[--cell-radius] dyn:data-[range-end=true]:rounded-r-[--cell-radius] dyn:data-[range-end=true]:bg-primary dyn:data-[range-end=true]:text-primary-foreground",
        "dyn:data-[range-middle=true]:rounded-none dyn:data-[range-middle=true]:bg-muted dyn:data-[range-middle=true]:text-foreground",
        "dyn:data-[range-start=true]:rounded-[--cell-radius] dyn:data-[range-start=true]:rounded-l-[--cell-radius] dyn:data-[range-start=true]:bg-primary dyn:data-[range-start=true]:text-primary-foreground",
        "dyn:data-[selected-single=true]:bg-primary dyn:data-[selected-single=true]:text-primary-foreground",
        "dyn:[&>span]:text-xs dyn:[&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
