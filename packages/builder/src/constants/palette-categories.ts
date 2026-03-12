import type { FieldType } from "./field-types.js";

export type PaletteItemConfig = {
  type: FieldType;
  label: string;
  defaultLabel?: string;
  defaultPlaceholder?: string;
  iconName: string;
};

export type PaletteCategory = {
  title: string;
  items: PaletteItemConfig[];
};

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    title: "Text",
    items: [
      { type: "text", label: "Short text", defaultLabel: "Short text", iconName: "ShortText" },
      { type: "textarea", label: "Large text", defaultLabel: "Large text", iconName: "AlignLeft" },
      { type: "text", label: "Email", defaultLabel: "Email", defaultPlaceholder: "ex: email@example.com", iconName: "Mail" },
      { type: "text", label: "Phone number", defaultLabel: "Phone number", defaultPlaceholder: "Your phone number", iconName: "Phone" },
    ],
  },
  {
    title: "Date and time",
    items: [
      { type: "date", label: "Calendar", defaultLabel: "Date", iconName: "Calendar" },
      { type: "time", label: "Time", defaultLabel: "Time", iconName: "Clock" },
      { type: "datetime", label: "Date & time", defaultLabel: "Date and time", iconName: "CalendarClock" },
    ],
  },
  {
    title: "Selection",
    items: [
      { type: "radio", label: "Radio", defaultLabel: "Options", iconName: "Circle" },
      { type: "checkbox", label: "Checkbox", defaultLabel: "Checkboxes", iconName: "CheckSquare" },
      { type: "select", label: "Dropdowns", defaultLabel: "Select option", iconName: "ChevronDown" },
      { type: "boolean", label: "Toggle", defaultLabel: "Toggle", iconName: "ToggleLeft" },
    ],
  },
  {
    title: "Media Elements",
    items: [
      { type: "upload", label: "Image", defaultLabel: "Upload image", iconName: "Image" },
      { type: "upload", label: "File", defaultLabel: "Upload file", iconName: "Upload" },
      { type: "signature", label: "Signature", defaultLabel: "Signature", iconName: "PenLine" },
    ],
  },
  {
    title: "Layout",
    items: [
      { type: "title", label: "Title", defaultLabel: "Section title", iconName: "Type" },
      { type: "divider", label: "Divider", defaultLabel: "Divider", iconName: "Minus" },
      { type: "group", label: "Group", defaultLabel: "Group", iconName: "Folder" },
    ],
  },
];
