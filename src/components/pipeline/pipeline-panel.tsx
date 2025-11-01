import { Button } from "@/components/ui/button";
import { usePipelinesStore } from "@/domain/stores/pipelines-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { copyToClipboard } from "@/lib/clipboard";
import { useShortcuts } from "@/lib/hooks/use-shortcuts";
import { cn } from "@/lib/utils";
import { Fancy, type FancyWindow, type UiWindow } from "@/lib/window";
import { useState } from "react";
import { PipelineDialog } from "./pipeline-dialog";

const trimCommand = (cmd: string) => {
  const maxSize = 60;
  return cmd.length > maxSize ? cmd.slice(0, maxSize - 1).trimEnd() + "…" : cmd;
};

const move = ({
  window,
  up,
  shift,
  commandsSize,
}: {
  window: UiWindow | null;
  up: boolean;
  shift: boolean;
  commandsSize: number;
}): UiWindow => {
  const cursor = window?.cursor || 0;
  const size = window?.size || 0;

  const newCursor =
    shift && !up
      ? cursor
      : Math.max(0, Math.min(commandsSize - 1, cursor + (up ? -1 : 1)));

  const newSize = shift ? size + 1 : 1;

  return {
    cursor: newCursor,
    size: Math.min(newSize, commandsSize - newCursor),
  };
};

export const PipelinePanel = () => {
  const pipelines = usePipelinesStore((s) => s.pipelines);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  const focusedPipeline = pipelines.find((p) => p.id === focusedPipelineId);
  const commands = focusedPipeline?.commands ?? [];
  const commandsWindow = useUiStore((s) => s.commandsWindow);
  const window = Fancy(commandsWindow);
  const setCommandsWindow = useUiStore((s) => s.setCommandsWindow);
  const [copied, setCopied] = useState(new Set<number>());
  const [currentDialog, setCurrentDialog] = useState("");

  const yank = (wnd: FancyWindow) => {
    if (commands.length === 0) return;

    const selectedCommands = wnd.slice(commands);

    if (wnd.size === 1) {
      copyToClipboard(selectedCommands[0].value);
    } else {
      const joinedCommands = selectedCommands
        .map((cmd) => cmd.value)
        .join(" && ");
      copyToClipboard(joinedCommands);
    }
    setCopied(new Set(wnd.range()));
  };

  const setWindow = (w: UiWindow) => {
    setCommandsWindow(w);
    setCopied(new Set<number>());
  };

  useShortcuts(
    {
      n: () => setCurrentDialog("Pipeline"),
      e: () => setCurrentDialog("Edit"),
      j: () =>
        setWindow(
          move({
            window,
            up: false,
            shift: false,
            commandsSize: commands.length,
          })
        ),
      k: () =>
        setWindow(
          move({
            window,
            up: true,
            shift: false,
            commandsSize: commands.length,
          })
        ),
      y: () => yank(window),
      "shift+j": () =>
        setWindow(
          move({
            window,
            up: false,
            shift: true,
            commandsSize: commands.length,
          })
        ),
      "shift+k": () =>
        setWindow(
          move({ window, up: true, shift: true, commandsSize: commands.length })
        ),
    },
    {
      enabled: currentDialog === "",
    }
  );

  const handleButtonClick = (i: number, event: React.MouseEvent) => {
    let newWindow: UiWindow;

    if (event.shiftKey && window) {
      const start = Math.min(window.cursor, i);
      const end = Math.max(window.cursor, i);
      newWindow = { cursor: start, size: end - start + 1 };
    } else newWindow = { cursor: i, size: 1 };

    setWindow(newWindow);
    yank(Fancy(newWindow));
  };

  return (
    <div className="flex">
      <div>
        <h1 className="text-xl mb-2">
          {focusedPipeline?.title || "Untitled Pipeline"}
        </h1>
        <div className="flex flex-col gap-2">
          {commands.map((command, index) => (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground empty:hidden w-fit">
                {command.description}
              </p>
              <Button
                key={index}
                variant="outline"
                onClick={(event) => handleButtonClick(index, event)}
                className={cn(
                  "border-2 justify-start",
                  window?.inBounds(index) && "border-pink-600",
                  copied.has(index) && "border-green-500"
                )}
              >
                {trimCommand(command.value)}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <PipelineDialog
        open={currentDialog === "Pipeline" || currentDialog === "Edit"}
        onClose={() => setCurrentDialog("")}
        pipeline={
          focusedPipeline && currentDialog === "Edit"
            ? focusedPipeline
            : undefined
        }
      />
    </div>
  );
};
