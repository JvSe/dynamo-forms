import { useDraggable } from "@dnd-kit/core";
import {
  AlignLeft,
  Calendar,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  Circle,
  Clock,
  Folder,
  Image,
  Mail,
  Minus,
  PenLine,
  Phone,
  Search,
  ToggleLeft,
  Type,
  Upload,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { PALETTE_CATEGORIES, type PaletteItemConfig } from "../constants/palette-categories.js";
import { cn } from "../lib/utils.js";

const PALETTE_DRAG_TYPE = "field-palette";

type IconProps = { size?: number | string; className?: string; stroke?: string; fill?: string; strokeWidth?: number };

/** Custom icon: same as Lucide AlignLeft but only first 2 lines (no third stroke). */
function ShortTextIcon({ size = 24, stroke = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21 6H3" />
      <path d="M15 12H3" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  AlignLeft,
  ShortText: ShortTextIcon,
  Mail,
  Phone,
  Calendar,
  Clock,
  CalendarClock,
  Circle,
  CheckSquare,
  ChevronDown,
  ToggleLeft,
  Image,
  Upload,
  PenLine,
  Type,
  Minus,
  Folder,
};

/** Gradient [start, end] colors for each icon (used in SVG linearGradient). */
const ICON_GRADIENT_STOPS: Record<string, [string, string]> = {
  AlignLeft: ["#93c5fd", "#60a5fa"],
  ShortText: ["#93c5fd", "#60a5fa"],
  Mail: ["#5eead4", "#2dd4bf"],
  Phone: ["#86efac", "#4ade80"],
  Calendar: ["#fde047", "#facc15"],
  Clock: ["#f9a8d4", "#ec4899"],
  CalendarClock: ["#fb923c", "#f97316"],
  Circle: ["#fdba74", "#f97316"],
  CheckSquare: ["#fb923c", "#ea580c"],
  ChevronDown: ["#93c5fd", "#3b82f6"],
  ToggleLeft: ["#86efac", "#22c55e"],
  Image: ["#fde047", "#eab308"],
  Upload: ["#f9a8d4", "#db2777"],
  PenLine: ["#c4b5fd", "#8b5cf6"],
  Type: ["#94a3b8", "#64748b"],
  Minus: ["#cbd5e1", "#94a3b8"],
  Folder: ["#93c5fd", "#2563eb"],
};

export type PaletteDragData = {
  source: "palette";
  fieldType: PaletteItemConfig["type"];
  label: string;
  defaultLabel?: string;
  defaultPlaceholder?: string;
};

export function getPaletteDragId(item: PaletteItemConfig): string {
  return `${PALETTE_DRAG_TYPE}-${item.type}-${item.label}`;
}

const ICON_SIZE = 24;

function PaletteItem({ item, onAddField }: { item: PaletteItemConfig; onAddField?: (data: PaletteDragData) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: getPaletteDragId(item),
    data: {
      source: "palette" as const,
      fieldType: item.type,
      label: item.label,
      defaultLabel: item.defaultLabel,
      defaultPlaceholder: item.defaultPlaceholder,
    },
  });

  const Icon = ICON_MAP[item.iconName] ?? AlignLeft;
  const [start] = ICON_GRADIENT_STOPS[item.iconName] ?? ICON_GRADIENT_STOPS.AlignLeft;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() =>
        onAddField?.({
          source: "palette",
          fieldType: item.type,
          label: item.label,
          defaultLabel: item.defaultLabel,
          defaultPlaceholder: item.defaultPlaceholder,
        })
      }
      className={cn(
        "flex flex-col items-start justify-between min-h-[88px] py-3 px-3.5 bg-white rounded-[10px] cursor-pointer text-xs font-medium text-gray-900 select-none",
        isDragging
          ? "border-2 border-[#1a73e8] shadow-[0_4px_12px_rgba(26,115,232,0.3)]"
          : "border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-[#1a73e8] hover:shadow-[0_2px_8px_rgba(26,115,232,0.15)] transition-[border-color,box-shadow]"
      )}
    >
      <div className="flex items-center justify-center shrink-0 mb-2">
        <Icon
          size={ICON_SIZE}
          stroke={start}
          fill="none"
          strokeWidth={2}
        />
      </div>
      <span className="text-center leading-[1.2]">{item.label}</span>
    </div>
  );
}

export function FieldPalette({ onAddField }: { onAddField?: (data: PaletteDragData) => void }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PALETTE_CATEGORIES;
    return PALETTE_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <div className="p-3.5 flex flex-col gap-3.5 bg-white">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full py-2 px-2.5 pl-9 rounded-lg border border-gray-200 text-[13px] bg-gray-50 text-gray-900 outline-none"
        />
      </div>

      {filtered.map((category) => (
        <div key={category.title}>
          <div className="text-xs font-semibold text-gray-900 mb-2.5 tracking-[0.3px]">
            {category.title}
          </div>
          <div className="grid grid-cols-2 gap-2.5 items-stretch">
            {category.items.map((item) => (
              <PaletteItem key={getPaletteDragId(item)} item={item} onAddField={onAddField} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
