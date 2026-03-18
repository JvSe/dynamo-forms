"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Matcher } from "react-day-picker";
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
  /** Datas desabilitadas no calendário (ex: datas passadas, fins de semana) */
  disabledDate?: Matcher | Matcher[];
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
  /** Armazena em horário local para evitar offset de timezone (+3h no Brasil) */
  if (type === "datetime") return format(date, "yyyy-MM-dd'T'HH:mm");
  return format(date, DATE_FORMAT_ISO);
}

/**
 * Formata input de data enquanto o usuário digita (DD/MM/YYYY).
 * Aceita digitação DDMMYYYY ou paste de YYYY-MM-DD / YYYYMMDD.
 */
function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  // Paste em YYYY-MM-DD ou YYYYMMDD: primeiro bloco = ano
  const hasSlash = value.includes("/");
  const hasDash = value.includes("-");
  if (hasSlash || hasDash) {
    const sep = hasSlash ? "/" : "-";
    const parts = value.split(sep);
    if (parts[0]?.length === 4 && digits.length >= 8) {
      return `${digits.slice(6, 8)}/${digits.slice(4, 6)}/${digits.slice(0, 4)}`;
    }
  }
  // YYYYMMDD sem separadores (8 dígitos, ano primeiro)
  if (digits.length === 8) {
    const y = digits.slice(0, 4);
    if (y.startsWith("19") || y.startsWith("20")) {
      return `${digits.slice(6, 8)}/${digits.slice(4, 6)}/${digits.slice(0, 4)}`;
    }
  }
  // Digitação normal DD/MM/YYYY
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
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
  disabledDate,
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
      const formatted = formatDateInput(raw);
      setInputValue(formatted);
      const valueFormattedToDate = formatted
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d{2})(\d{4})$/, "$3-$2-$1");
      if (formatted.length >= 10) {
        const parsed = parse(valueFormattedToDate, DATE_FORMAT_ISO, new Date());
        if (isValid(parsed)) {
          onChange?.(formatDateToValue(parsed, "date"));
          setMonth(parsed);
        }
      }
    };

    const handleSelect = React.useCallback(
      (date: Date | undefined) => {
        if (!date) return;
        setInputValue(formatDateDisplay(date, "date"));
        onChange?.(formatDateToValue(date, "date"));
        setOpen(false);
      },
      [onChange]
    );

    return (
      <div className={cn("dyn:relative dyn:flex dyn:w-full", className)}>
        <Input
          id={id}
          value={inputValue}
          placeholder={placeholder ?? "Data de nascimento"}
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
          className="dyn:pr-9"
          maxLength={10}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              "dyn:absolute dyn:right-2 dyn:top-1/2 dyn:-translate-y-1/2 dyn:rounded dyn:border-0 dyn:bg-transparent dyn:px-2 dyn:py-0",
              "dyn:hover:bg-accent/50 dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2",
              "dyn:disabled:pointer-events-none dyn:disabled:opacity-50"
            )}
            disabled={disabled}
            aria-label="Selecionar data"
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="dyn:size-5 dyn:text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent
            className="dyn:w-auto dyn:min-w-0 dyn:overflow-hidden dyn:p-0! dyn:bg-popover dyn:text-popover-foreground"
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
              disabled={disabledDate}
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
    onChange?.(format(combined, "yyyy-MM-dd'T'HH:mm"));
  };

  return (
    <div className={cn("dyn:flex dyn:w-full dyn:gap-2", className)}>
      <div className="dyn:relative dyn:flex dyn:min-w-0 dyn:flex-1">
        <Input
          id={id}
          value={formatDateDisplay(datePart, "date")}
          placeholder={placeholder ?? DATE_FORMAT_DISPLAY}
          readOnly
          onClick={() => setOpen(true)}
          disabled={disabled}
          error={error}
          success={success}
          className="dyn:cursor-pointer dyn:pr-9"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              "dyn:absolute dyn:right-0 dyn:top-0 dyn:h-full dyn:rounded-r-md dyn:border dyn:border-l-0 dyn:border-input dyn:bg-transparent dyn:px-2",
              "dyn:hover:bg-accent dyn:focus-visible:outline-none dyn:focus-visible:ring-2 dyn:focus-visible:ring-ring dyn:focus-visible:ring-offset-2",
              "dyn:disabled:pointer-events-none dyn:disabled:opacity-50"
            )}
            disabled={disabled}
            aria-label="Selecionar data"
          >
            <CalendarIcon className="dyn:size-4 dyn:text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent
            className="dyn:w-auto dyn:min-w-0 dyn:overflow-hidden dyn:p-0! dyn:bg-popover dyn:text-popover-foreground"
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
              disabled={disabledDate}
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
        className="dyn:min-w-0 dyn:flex-1"
      />
    </div>
  );
};
