import { type ModeName } from "@/lib/stores/nuphys-store";
import { useNuphy } from "./use-nuphy";

export const useRootNuphy = () => {
  const { enableMode } = useNuphy({
    name: "root",
    enabled: true,
    keys: (key, event) => {
      const modes: Record<string, ModeName> = {
        ":": "showingCommand",
        "cmd+k": "showingNotes",
        "alt+k": "showingNotes",
      };

      const name = modes[key];
      if (name) {
        event.preventDefault();
        enableMode(name);
      }

      return !!name;
    },
  });
};
