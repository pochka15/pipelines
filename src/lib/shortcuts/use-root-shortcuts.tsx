import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { keyboardShortcuts } from "./mappings";
import type { ModeName } from "./shortcuts-modes";

export const useRootShortcuts = () => {
  const { enableMode } = useShortcuts({
    name: "root",
    enabled: true,
    keys: (key, event) => {
      const m = (keyName: keyof typeof keyboardShortcuts.root) =>
        keyboardShortcuts.root[keyName].key;

      const modes: Record<string, ModeName> = {
        [m(":")]: "showingCommand",
        [m("cmd+k")]: "showingNotes",
        [m("alt+k")]: "showingNotes",
      };

      const name = modes[key];
      if (name) {
        event.preventDefault();
        enableMode(name);
        return true;
      }

      return false;
    },
  });
};
