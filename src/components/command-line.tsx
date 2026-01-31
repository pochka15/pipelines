import { usePipelinesStore } from "@/domain/stores/pipelines-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { keyboardShortcuts } from "@/lib/nuphy/mappings";
import { useNuphy } from "@/lib/nuphy/use-nuphy";
import {
  executeEditCommand,
  getEditSuggestion,
  parseEditCommand,
} from "@/lib/random/edit-command-utils";
import { cn } from "@/lib/random/utils";
import { useNuphyMode } from "@/lib/stores/nuphys-store";
import { head } from "lodash";
import { type FC, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
  const pipelines = usePipelinesStore((s) => s.pipelines);
  const addPipeline = usePipelinesStore((s) => s.addPipeline);
  const updatePipeline = usePipelinesStore((s) => s.updatePipeline);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  const focusedPipeline = pipelines.find((p) => p.id === focusedPipelineId);
  const [command, setCommand] = useState("");
  const { enabled } = useNuphyMode("showingCommand");

  const suggestion = getEditSuggestion(
    command,
    focusedPipeline?.vars.parsed || []
  );

  const { disableModes } = useNuphy({
    name: "command",
    enabled,
    keys: (key, event) => {
      const m = (keyName: keyof typeof keyboardShortcuts.command) =>
        keyboardShortcuts.command[keyName].key;

      if (key === m("Escape")) {
        disableModes(["showingCommand"]);
        return true;
      } else if (key === m("Enter")) {
        disableModes(["showingCommand"]);
        submit();
        return true;
      } else if (key === "Tab" && suggestion) {
        setCommand(command + suggestion);
        event.preventDefault();
        return true;
      }
      return true;
    },
  });

  const submitEdit = () => {
    if (!focusedPipeline) return;

    const result = executeEditCommand(command, focusedPipeline);

    if (result.success) {
      updatePipeline(result.updated);
      const parsed = parseEditCommand(command);
      toast(`Updated ${parsed?.varName}`, { position: "bottom-left" });
    } else {
      toast.error(result.error, { position: "bottom-left" });
    }
  };

  const submit = () => {
    if (command.startsWith("edit ")) submitEdit();

    switch (command) {
      case "tmp": {
        const notes = getNotes();
        if (notes) {
          const prefix = "- foo =";
          console.log(findValue(notes, prefix));
        }
        break;
      }
      case "clone": {
        if (focusedPipeline) {
          addPipeline({
            ...focusedPipeline,
            title: `${focusedPipeline.title} (clone)`,
          });
        }
        break;
      }
      case "github": {
        window.open("https://github.com/pochka15/pipelines", "_blank");
        break;
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
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="text-foreground relative z-10 max-w-full flex-1 border-none bg-transparent font-mono text-sm outline-none"
          autoComplete="off"
          spellCheck="false"
        />
        {suggestion && (
          <span className="text-variable-set pointer-events-none absolute left-0 font-mono text-sm">
            <span className="invisible">{command}</span>
            {suggestion}
          </span>
        )}
      </div>
    </div>
  );
};
