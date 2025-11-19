import {
  usePipelinesStore,
  type NewPipeline,
} from "@/domain/stores/pipelines-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { copyToClipboard } from "@/lib/clipboard";
import { useNuphy } from "@/lib/nuphy/use-nuphy";
import { withVars } from "@/lib/template-vars";
import { Fancy, type FancyWindow, type UiWindow } from "@/lib/window";
import type { DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import { CommandsList } from "./commands-list";
import { PipelineForm } from "./pipeline-form";

const withinBounds = (n: number, lower: number, upper: number) =>
  Math.max(lower, Math.min(upper, n));

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
  const size = window?.size || 0;
  const down = !up;

  let cursor = window?.cursor || 0;
  if (up) cursor -= 1;
  else if (down && !shift) cursor += size;
  cursor = withinBounds(cursor, 0, commandsSize - 1);

  const newSize = shift ? size + 1 : 1;

  return {
    cursor,
    size: Math.min(newSize, commandsSize - cursor),
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

  useNuphy({
    name: "pipelinePanel",
    enabled: !isEditing && !showForm,
    keys: (key, evt) => {
      const mapping = {
        n: () => {
          evt.preventDefault();
          setCurrentForm("Pipeline");
        },
        e: () => {
          evt.preventDefault();
          setCurrentForm("Edit");
        },
        v: () => {
          evt.preventDefault();
          onSwitchToVars();
        },
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
        Escape: () => setWindow({ cursor: window.cursor, size: 1 }),
        "shift+J": () =>
          setWindow(
            move({
              window,
              up: false,
              shift: true,
              commandsSize: commands.length,
            })
          ),
        "shift+K": () =>
          setWindow(
            move({
              window,
              up: true,
              shift: true,
              commandsSize: commands.length,
            })
          ),
      };

      const handled = key in mapping;
      if (handled) mapping[key as keyof typeof mapping]();
      return handled;
    },
  });

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
      <h1 className="self-start text-xl">
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
