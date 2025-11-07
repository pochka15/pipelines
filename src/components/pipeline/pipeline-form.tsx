import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type NewPipeline,
  type Pipeline,
} from "@/domain/stores/pipelines-store";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import { CommandItem, type CommandItemData } from "./command-item";
import { useShortcuts } from "@/lib/hooks/use-shortcuts";
import { isNil } from "lodash";

export const PipelineForm: FC<{
  onSubmit: (pipeline: NewPipeline) => void;
  onClose: () => void;
  initialPipeline?: Pipeline;
}> = ({ onSubmit, onClose, initialPipeline }) => {
  const [title, setTitle] = useState(initialPipeline?.title || "");
  const [commands, setCommands] = useState<CommandItemData[]>(
    initialPipeline?.commands.map((cmd, i) => ({
      id: `cmd-${i}`,
      description: cmd.description,
      value: cmd.value,
    })) || [{ id: "cmd-0", value: "" }]
  );

  const isEditing = !isNil(initialPipeline);
  const canSubmit = !title.trim() || commands.every((cmd) => !cmd.value.trim());

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
    });
  };

  useShortcuts({
    escape: isEditing ? submit : onClose,
    "cmd+j": isEditing ? submit : onClose,
  });

  return (
    <div className="space-y-4 max-w-2xl">
      <Input
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
