import {
  usePipelinesStore,
  type NewPipeline,
} from "@/domain/stores/pipelines-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { copyToClipboard } from "@/lib/clipboard";
import { useShortcuts } from "@/lib/hooks/use-shortcuts";
import { withVars } from "@/lib/template-vars";
import { cn } from "@/lib/utils";
import { Fancy, type FancyWindow, type UiWindow } from "@/lib/window";
import type { DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import { CommandsList } from "./commands-list";
import { PipelineForm } from "./pipeline-form";

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

export const PipelinePanel = ({
  onSwitchToVars,
}: {
  onSwitchToVars: () => void;
}) => {
  const pipelines = usePipelinesStore((s) => s.pipelines);
  const addPipeline = usePipelinesStore((s) => s.addPipeline);
  const updatePipeline = usePipelinesStore((s) => s.updatePipeline);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  const focusedPipeline = pipelines.find((p) => p.id === focusedPipelineId);
  const commands = focusedPipeline?.commands ?? [];
  const commandsWindow = useUiStore((s) => s.commandsWindow);
  const window = Fancy(commandsWindow);
  const setCommandsWindow = useUiStore((s) => s.setCommandsWindow);
  const [copied, setCopied] = useState(new Set<number>());
  const [isEditing, setIsEditing] = useState(false);
  const [currentForm, setCurrentForm] = useState("");
  const showForm = currentForm !== "";

  const yank = (wnd: FancyWindow) => {
    if (commands.length === 0 || !focusedPipeline) return;

    const selectedCommands = wnd.slice(commands);
    const vars = focusedPipeline.vars.parsed;

    if (wnd.size === 1) {
      copyToClipboard(withVars(selectedCommands[0].value, vars));
    } else {
      const joinedCommands = selectedCommands
        .map((cmd) => withVars(cmd.value, vars))
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
      n: () => setCurrentForm("Pipeline"),
      e: () => setCurrentForm("Edit"),
      v: onSwitchToVars,
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
      enabled: !isEditing && !showForm,
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

  const editedPipeline =
    focusedPipeline && currentForm === "Edit" ? focusedPipeline : undefined;

  const edit = (p: NewPipeline) => {
    if (editedPipeline) updatePipeline({ ...p, id: editedPipeline.id });
    else addPipeline(p);
    setCurrentForm("");
  };

  const reorder = (result: DropResult) => {
    if (!result.destination || !focusedPipeline) return;

    const items = Array.from(commands);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updatePipeline({
      ...focusedPipeline,
      commands: items,
    });
  };

  const handleEdit = (index: number, value: string) => {
    if (!focusedPipeline) return;

    const updatedCommands = [...commands];
    updatedCommands[index] = { ...updatedCommands[index], value };

    updatePipeline({
      ...focusedPipeline,
      commands: updatedCommands,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl self-start">
        {focusedPipeline?.title || "Untitled Pipeline"}
      </h1>
      <CommandsList
        isEditing={isEditing}
        isHidden={showForm}
        commands={commands}
        window={window}
        copied={copied}
        onButtonClick={handleButtonClick}
        onReorder={reorder}
        onStartEditing={() => setIsEditing(true)}
        onCancelEditing={() => setIsEditing(false)}
        onFinishEditing={handleEdit}
      />
      {showForm && (
        <PipelineForm
          onSubmit={edit}
          onClose={() => setCurrentForm("")}
          initialPipeline={editedPipeline}
        />
      )}
    </div>
  );
};
