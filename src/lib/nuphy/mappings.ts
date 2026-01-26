export type KeyHandler = (key: string, event: KeyboardEvent) => boolean;

let prio = 1;
const next = () => prio++;

export const nuphyPriorities = {
  notesPanel: next(), // handled first
  command: next(),
  pipelineForm: next(),
  varsPanel: next(),
  commandItem: next(),
  pipelinePanel: next(),
  help: next(),
  root: next(),
} as const;

export type KnownNuphy = keyof typeof nuphyPriorities;

export type ShortcutEntry = {
  key: string;
  description: string;
  displayedKey?: string;
};

const pipelinePanel = {
  n: { key: "n", description: "New pipeline" },
  e: { key: "e", description: "Edit pipeline" },
  v: { key: "v", description: "Switch to vars" },
  j: { key: "j", description: "Move down" },
  ArrowDown: { key: "ArrowDown", description: "Move down", displayedKey: "↓" },
  k: { key: "k", description: "Move up" },
  ArrowUp: { key: "ArrowUp", description: "Move up", displayedKey: "↑" },
  y: { key: "y", description: "Yank (copy)" },
  "shift+J": {
    key: "shift+J",
    description: "Extend selection down",
    displayedKey: "J",
  },
  "shift+K": {
    key: "shift+K",
    description: "Extend selection up",
    displayedKey: "K",
  },
  "shift+ArrowDown": {
    key: "shift+ArrowDown",
    description: "Extend selection down",
    displayedKey: "shift+↓",
  },
  "shift+ArrowUp": {
    key: "shift+ArrowUp",
    description: "Extend selection up",
    displayedKey: "shift+↑",
  },
  Escape: {
    key: "Escape",
    description: "Reset selection",
    displayedKey: "Esc",
  },
} satisfies Record<string, ShortcutEntry>;

const notesPanel = {
  Escape: {
    key: "Escape",
    description: "Save and close",
    displayedKey: "Esc",
  },
} satisfies Record<string, ShortcutEntry>;

const command = {
  Escape: {
    key: "Escape",
    description: "Close command line",
    displayedKey: "Esc",
  },
  Enter: {
    key: "Enter",
    description: "Execute command",
  },
} satisfies Record<string, ShortcutEntry>;

const pipelineForm = {
  Escape: {
    key: "Escape",
    description: "Close form",
    displayedKey: "Esc",
  },
  "cmd+j": {
    key: "cmd+j",
    description: "Save and close",
    displayedKey: "⌘J",
  },
  "alt+j": {
    key: "alt+j",
    description: "Save and close",
    displayedKey: "Alt+J",
  },
} satisfies Record<string, ShortcutEntry>;

const varsPanel = {
  Escape: {
    key: "Escape",
    description: "Go back to pipeline",
    displayedKey: "Esc",
  },
} satisfies Record<string, ShortcutEntry>;

const root = {
  ":": {
    key: ":",
    description: "Enter command mode",
  },
  h: {
    key: "h",
    description: "Toggle help",
  },
  "cmd+k": {
    key: "cmd+k",
    description: "Quick notes",
    displayedKey: "⌘K",
  },
  "alt+k": {
    key: "alt+k",
    description: "Quick notes",
    displayedKey: "Alt+K",
  },
} satisfies Record<string, ShortcutEntry>;

const help = {
  h: {
    key: "h",
    description: "Toggle help",
  },
} satisfies Record<string, ShortcutEntry>;

const commandItem = {
  s: {
    key: "s",
    description: "Edit in-place",
  },
  Escape: {
    key: "Escape",
    description: "Cancel edit",
    displayedKey: "Esc",
  },
  Enter: {
    key: "Enter",
    description: "Save changes",
  },
} satisfies Record<string, ShortcutEntry>;

export const keyboardShortcuts = {
  notesPanel,
  command,
  pipelineForm,
  varsPanel,
  commandItem,
  pipelinePanel,
  help,
  root,
} satisfies Record<KnownNuphy, Record<string, ShortcutEntry>>;
