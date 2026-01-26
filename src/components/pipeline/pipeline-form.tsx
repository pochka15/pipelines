import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type NewPipeline,
  type Pipeline,
} from "@/domain/stores/pipelines-store";
import { keyboardShortcuts } from "@/lib/nuphy/mappings";
import { useNuphy } from "@/lib/nuphy/use-nuphy";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { isNil } from "lodash";
import { Plus } from "lucide-react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { CommandItem, type CommandItemData } from "./command-item";

export const PipelineForm: FC<{
  onSubmit: (pipeline: NewPipeline) => void;
  onClose: () => void;
  initialPipeline?: Pipeline;
}> = ({ onSubmit, onClose, initialPipeline }) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialPipeline?.title || "");
  const [commands, setCommands] = useState<CommandItemData[]>(
    initialPipeline?.commands.map((cmd, i) => ({
      id: `cmd-${i}`,
      description: cmd.description,
      value: cmd.value,
    })) || [{ id: "cmd-0", value: "" }]
  );

  const isEditing = !isNil(initialPipeline);
  const canSubmit =
    title.trim() !== "" && commands.every((cmd) => cmd.value.trim() !== "");

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(commands);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCommands(items);
  };

  const updateCommand = (id: string, updates: Partial<CommandItemData>) => {
    setCommands((prev) =>
      prev.map((cmd) => (cmd.id === id ? { ...cmd, ...updates } : cmd))
    );
  };

  const removeCommand = (id: string) => {
    setCommands((prev) => prev.filter((cmd) => cmd.id !== id));
  };

  const addCommand = (beforeId?: string) => {
    const newId = `cmd-${Date.now()}`;
    const newCommand: CommandItemData = { id: newId, value: "" };

    if (beforeId) {
      const index = commands.findIndex((cmd) => cmd.id === beforeId);
      setCommands((prev) => [
        ...prev.slice(0, index),
        newCommand,
        ...prev.slice(index),
      ]);
    } else {
      setCommands((prev) => [...prev, newCommand]);
    }
  };

  const addCommandBefore = (id: string) => addCommand(id);
  const addCommandAfter = (id: string) => {
    const index = commands.findIndex((cmd) => cmd.id === id);
    const newId = `cmd-${Date.now()}`;
    const newCommand: CommandItemData = { id: newId, value: "" };

    setCommands((prev) => [
      ...prev.slice(0, index + 1),
      newCommand,
      ...prev.slice(index + 1),
    ]);
  };

  const submit = () => {
    onSubmit({
      title: title || "Untitled",
      commands: commands
        .filter((cmd) => cmd.value.trim())
        .map((cmd) => ({
          id: cmd.id,
          value: cmd.value,
          description: cmd.description,
        })),
      vars: initialPipeline?.vars ?? { raw: "", parsed: [] },
    });
  };

  useNuphy({
    name: "pipelineForm",
    enabled: true,
    keys: (key) => {
      const m = (keyName: keyof typeof keyboardShortcuts.pipelineForm) =>
        keyboardShortcuts.pipelineForm[keyName].key;

      const isEscape = key === m("Escape");
      const isSave = key === m("cmd+j") || key === m("alt+j");

      if (isEscape && !isEditing) {
        onClose();
        return true;
      } else if ((isEscape && isEditing) || isSave) {
        submit();
        return true;
      }

      const activeElement = document.activeElement;
      return (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement
      );
    },
  });

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className="max-w-2xl space-y-4">
      <Input
        ref={titleRef}
        placeholder="Pipeline title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-medium"
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="commands">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {commands.map((command, index) => (
                <CommandItem
                  key={command.id}
                  item={command}
                  index={index}
                  onUpdate={updateCommand}
                  onRemove={removeCommand}
                  onAddBefore={addCommandBefore}
                  onAddAfter={addCommandAfter}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => addCommand()}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Command
        </Button>

        <Button onClick={submit} disabled={!canSubmit}>
          Save Pipeline
        </Button>
      </div>
    </div>
  );
};
