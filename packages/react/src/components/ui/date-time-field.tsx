"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type DateType = "date" | "datetime" | "time";

export interface DateTimeFieldProps {
  id?: string;
  value?: Date;
  onChange?: (value: string) => void;
  dateType?: DateType;
  placeholder?: string;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  className?: string;
}

const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_ISO = "yyyy-MM-dd";
const TIME_FORMAT = "HH:mm";
const DATETIME_FORMAT_DISPLAY = "dd/MM/yyyy HH:mm";

function formatDateDisplay(
  date: Date | undefined,
  type: DateType
): string {
  if (!date || !isValid(date)) return "";
  if (type === "time") return format(date, TIME_FORMAT);
  if (type === "datetime")
    return format(date, DATETIME_FORMAT_DISPLAY, { locale: ptBR });
  return format(date, DATE_FORMAT_DISPLAY, { locale: ptBR });
}

function formatDateToValue(
  date: Date | undefined,
  type: DateType
): string {
  if (!date || !isValid(date)) return "";
  if (type === "time") return format(date, TIME_FORMAT);
  if (type === "datetime") return date.toISOString().slice(0, 16);
  return format(date, DATE_FORMAT_ISO);
}

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  id,
  value,
  onChange,
  dateType = "date",
  placeholder,
  error,
  success,
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value);
  const [inputValue, setInputValue] = React.useState(() =>
    formatDateDisplay(value, dateType)
  );

  const dateOnly = dateType === "date";
  const timeOnly = dateType === "time";

  React.useEffect(() => {
    setInputValue(formatDateDisplay(value, dateType));
  }, [value, dateType]);

  React.useEffect(() => {
    if (value) setMonth(value);
  }, [value]);

  if (timeOnly) {
    const timeValue = value ? format(value, TIME_FORMAT) : "";
    return (
      <Input
        id={id}
        type="time"
        value={timeValue}
        onChange={(e) => onChange?.(e.target.value || "")}
        disabled={disabled}
        error={error}
        success={success}
        className={className}
      />
    );
  }

  if (dateOnly) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setInputValue(raw);
      const parsed = parse(raw, DATE_FORMAT_DISPLAY, new Date(), {
        locale: ptBR,
      });
      if (isValid(parsed)) {
        onChange?.(formatDateToValue(parsed, "date"));
        setMonth(parsed);
      }
    };

    const handleSelect = (date: Date | undefined) => {
      if (!date) return;
      setInputValue(formatDateDisplay(date, "date"));
      onChange?.(formatDateToValue(date, "date"));
      setOpen(false);
    };

    return (
      <div className={cn("relative flex w-full", className)}>
        <Input
          id={id}
          value={inputValue}
          placeholder={placeholder ?? DATE_FORMAT_DISPLAY}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          disabled={disabled}
          error={error}
          success={success}
          className="pr-9"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              "absolute right-0 top-0 h-full rounded-r-md border border-l-0 border-input bg-transparent px-2",
              "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
            disabled={disabled}
            aria-label="Selecionar data"
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={8}
          >
            <Calendar
              mode="single"
              selected={value}
              month={month}
              onMonthChange={setMonth}
              onSelect={handleSelect}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // datetime: date picker + time input
  const datePart = value ? new Date(value) : undefined;
  const timeStr = value ? format(value, TIME_FORMAT) : "";

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const combined = new Date(date);
    if (value) {
      combined.setHours(value.getHours(), value.getMinutes(), 0, 0);
    }
    onChange?.(formatDateToValue(combined, "datetime"));
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    if (!t) {
      onChange?.("");
      return;
    }
    const [h, m] = t.split(":").map(Number);
    const combined = datePart ? new Date(datePart) : new Date();
    combined.setHours(h, m, 0, 0);
    onChange?.(combined.toISOString().slice(0, 16));
  };

  return (
    <div className={cn("flex w-full gap-2", className)}>
      <div className="relative flex min-w-0 flex-1">
        <Input
          id={id}
          value={formatDateDisplay(datePart, "date")}
          placeholder={placeholder ?? DATE_FORMAT_DISPLAY}
          readOnly
          onClick={() => setOpen(true)}
          disabled={disabled}
          error={error}
          success={success}
          className="cursor-pointer pr-9"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              "absolute right-0 top-0 h-full rounded-r-md border border-l-0 border-input bg-transparent px-2",
              "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
            disabled={disabled}
            aria-label="Selecionar data"
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={8}
          >
            <Calendar
              mode="single"
              selected={datePart}
              month={month}
              onMonthChange={setMonth}
              onSelect={handleDateSelect}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Input
        type="time"
        value={timeStr}
        onChange={handleTimeChange}
        disabled={disabled}
        error={error}
        success={success}
        className="min-w-0 flex-1"
      />
    </div>
  );
};
