import { keyboardShortcuts, type ShortcutEntry } from "@/lib/nuphy/mappings";
import { useNuphy } from "@/lib/nuphy/use-nuphy";
import { cn } from "@/lib/random/utils";
import { useNuphyMode, useNuphyStore } from "@/lib/stores/nuphys-store";
import { useMemo } from "react";

export const Help = () => {
  const { enabled } = useNuphyMode("showingHelp");
  const activeNuphys = useNuphyStore((it) => it.activeNuphys);

  const { enableMode, disableModes } = useNuphy({
    name: "help",
    enabled: true,
    keys: (key) => {
      const m = (keyName: keyof typeof keyboardShortcuts.help) =>
        keyboardShortcuts.help[keyName].key;

      if (key === m("h")) {
        if (enabled) disableModes(["showingHelp"]);
        else enableMode("showingHelp");
        return true;
      }
      return false;
    },
  });

  const activeShortcuts = useMemo(() => {
    return activeNuphys
      .map((nuphy) => {
        const shortcuts = keyboardShortcuts[nuphy];
        const shortcutsList = Object.values(shortcuts);

        // Group by description
        const grouped = new Map<string, ShortcutEntry[]>();
        shortcutsList.forEach((shortcut) => {
          const existing = grouped.get(shortcut.description) || [];
          grouped.set(shortcut.description, [...existing, shortcut]);
        });

        // Merge keys with same description
        const mergedShortcuts = Array.from(grouped.entries()).map(
          ([description, entries]) => {
            const keys = entries.map((e) => e.displayedKey || e.key);

            // Add cmd+j and alt+j for Escape key
            if (entries.some((e) => e.key === "Escape")) {
              keys.push("⌘+J", "Alt+J");
            }

            return {
              key: keys.join(" / "),
              description,
            };
          }
        );

        return { nuphy, shortcuts: mergedShortcuts };
      })
      .filter((item) => item.shortcuts.length > 0);
  }, [activeNuphys]);

  return (
    <div
      className={cn(
        "bg-background border-border fixed right-4 bottom-4 z-50 w-80 rounded-lg border p-4 shadow-lg",
        !enabled && "hidden"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
        <button
          onClick={() => disableModes(["showingHelp"])}
          className="text-muted-foreground hover:text-foreground text-xl"
        >
          ×
        </button>
      </div>
      <div className="space-y-3">
        {activeShortcuts.map(({ nuphy, shortcuts }) => (
          <div key={nuphy}>
            <h3 className="text-muted-foreground mb-1.5 text-lg font-semibold capitalize">
              {nuphy}
            </h3>
            <div className="space-y-1 text-sm">
              {shortcuts.map((shortcut, ind) => (
                <p key={ind}>
                  <span className="bg-muted rounded px-1 font-mono text-xs">
                    {shortcut.key}
                  </span>{" "}
                  {shortcut.description}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
