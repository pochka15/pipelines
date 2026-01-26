import { type ModeName } from "@/lib/stores/nuphys-store";
import { keyboardShortcuts } from "./mappings";
import { useNuphy } from "./use-nuphy";

export const useRootNuphy = () => {
  const { enableMode } = useNuphy({
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
