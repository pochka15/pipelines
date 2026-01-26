import { keyboardShortcuts } from "@/lib/nuphy/mappings";
import { useNuphy } from "@/lib/nuphy/use-nuphy";
import { cn } from "@/lib/random/utils";
import { useNuphyMode } from "@/lib/stores/nuphys-store";
import { head } from "lodash";
import { type FC, useEffect, useRef, useState } from "react";
import { getNotes } from "./notes-panel/notes-panel-utils";

type CommandLineProps = {
  className?: string;
};

const findValue = (s: string, prefix: string) => {
  return head(
    s
      .split("\n")
      .filter((it) => it.startsWith(prefix))
      .map((it) => it.slice(prefix.length).trim())
  );
};

export const CommandLine: FC<CommandLineProps> = ({ className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [command, setCommand] = useState("");
  const { enabled } = useNuphyMode("showingCommand");

  const { disableModes } = useNuphy({
    name: "command",
    enabled,
    keys: (key) => {
      const m = (keyName: keyof typeof keyboardShortcuts.command) =>
        keyboardShortcuts.command[keyName].key;

      if (key === m("Escape")) {
        disableModes(["showingCommand"]);
        return true;
      } else if (key === m("Enter")) {
        disableModes(["showingCommand"]);
        submit();
        return true;
      }
      return false;
    },
  });

  const submit = () => {
    switch (command) {
      case "tmp": {
        const notes = getNotes();
        if (notes) {
          const prefix = "- foo =";
          console.log(findValue(notes, prefix));
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (enabled) inputRef.current?.focus();
    setCommand("");
  }, [enabled]);

  return (
    <div
      className={cn(
        "bg-background border-border fixed right-0 bottom-0 left-0 z-50 border-t p-2",
        !enabled && "hidden",
        className
      )}
    >
      <input
        ref={inputRef}
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        className="text-foreground max-w-full flex-1 border-none bg-transparent font-mono text-sm outline-none"
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};
